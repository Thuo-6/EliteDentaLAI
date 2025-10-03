import { useState, useEffect, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import type { VapiCall, AudioLevel, TranscriptEntry } from '../types/vapi';
import { DentalService } from '../services/dentalService';

// Enhanced VAPI configuration
const VAPI_CONFIG = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '3c016063-003f-482f-9ea3-40b50c02d546',
  assistantId: '1d07df21-4bef-48e8-a092-6ff324eb8b52', // Premium female voice agent
  maxRetries: 3,
  timeoutMs: 30000
};

export const useVapi = () => {
  const [call, setCall] = useState<VapiCall>({ id: '', status: 'idle' });
  const [audioLevels, setAudioLevels] = useState<AudioLevel>({ user: 0, assistant: 0 });
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'failed'>('healthy');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const vapiRef = useRef<Vapi | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    try {
      // Initialize VAPI with proper configuration
      const vapi = new Vapi(VAPI_CONFIG.publicKey);
      vapiRef.current = vapi;

      // Enhanced event handlers for conversational features
      vapi.on('call-start', () => {
        console.log('🎙️ Call started - Elite Dental AI Assistant active');
        setCall(prev => ({ 
          ...prev, 
          status: 'connecting',
          startTime: new Date(),
          id: `call-${Date.now()}`
        }));
        setIsCallActive(true);
        setIsLoading(false);
        setError(null);
        setConnectionHealth('healthy');
        reconnectAttemptsRef.current = 0;
      });

      vapi.on('call-end', () => {
        console.log('📞 Call ended - Thank you for using Elite Dental');
        setCall(prev => ({ 
          ...prev, 
          status: 'ended',
          endTime: new Date()
        }));
        setIsCallActive(false);
        setIsLoading(false);
        
        // Reset to idle after a brief delay
        setTimeout(() => {
          setCall(prev => ({ ...prev, status: 'idle' }));
        }, 2000);
      });

      vapi.on('speech-start', () => {
        console.log('🎤 Speech detected - Assistant listening...');
        setCall(prev => ({ ...prev, status: 'connected' }));
        setIsLoading(false);
      });

      vapi.on('speech-end', () => {
        console.log('🎤 Speech ended - Processing...');
      });

      // Enhanced message handling for real-time conversation
      vapi.on('message', (message: any) => {
        console.log('💬 Message received:', message);
        
        try {
          if (message.type === 'transcript') {
            const newEntry: TranscriptEntry = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              speaker: message.role === 'user' ? 'user' : 'assistant',
              text: message.transcript || message.text || '',
              timestamp: new Date(),
              confidence: message.confidence || 1
            };

            // Prevent duplicate entries
            setTranscript(prev => {
              const isDuplicate = prev.some(entry => 
                entry.text === newEntry.text && 
                entry.speaker === newEntry.speaker &&
                Math.abs(entry.timestamp.getTime() - newEntry.timestamp.getTime()) < 1000
              );
              
              if (isDuplicate) return prev;
              
              // Keep last 50 entries for performance
              const updated = [...prev, newEntry];
              return updated.slice(-50);
            });

            // Enhanced emergency detection for user messages
            if (message.role === 'user' && newEntry.text) {
              try {
                if (DentalService.initialize()) {
                  DentalService.handleEmergency(newEntry.text);
                }
              } catch (emergencyError) {
                console.error('Emergency handling error:', emergencyError);
              }
            }
          }

          // Handle function calls and tool usage
          if (message.type === 'function-call') {
            console.log('🔧 Function call:', message.functionCall);
            handleFunctionCall(message.functionCall);
          }

          // Handle conversation state changes
          if (message.type === 'conversation-update') {
            console.log('💭 Conversation update:', message);
          }

        } catch (messageError) {
          console.error('Error processing message:', messageError);
          setError('Error processing conversation');
        }
      });

      // Enhanced error handling with recovery
      vapi.on('error', (error: any) => {
        console.error('❌ VAPI Error:', error);
        
        // Handle "Meeting has ended" as normal termination, not an error
        if (error?.errorMsg === 'Meeting has ended' || 
            error?.error?.type === 'ejected' || 
            error?.error?.type === 'no-room' ||
            error?.error?.msg === 'Meeting has ended') {
          console.log('📞 Call ended normally - Meeting terminated');
          setCall(prev => ({ 
            ...prev, 
            status: 'ended',
            endTime: new Date()
          }));
          setIsCallActive(false);
          setIsLoading(false);
          setConnectionHealth('healthy');
          
          // Reset to idle after delay
          setTimeout(() => {
            setCall(prev => ({ ...prev, status: 'idle' }));
          }, 2000);
          return;
        }
        
        // Handle specific VAPI error types
        let errorMessage = 'Unknown VAPI error';
        let shouldRetry = false;
        
        if (error?.type === 'daily-call-join-error') {
          errorMessage = 'Failed to join voice session. Please try again.';
          shouldRetry = true;
        } else if (error?.type === 'start-method-error') {
          errorMessage = 'Failed to start voice assistant. Please check your connection.';
          shouldRetry = false;
        } else {
          errorMessage = error?.message || error?.errorMsg || error?.toString() || 'Unknown VAPI error';
          shouldRetry = true;
        }
        
        setError(errorMessage);
        setCall(prev => ({ ...prev, status: 'error' }));
        setIsLoading(false);
        setConnectionHealth('failed');

        // Attempt automatic recovery only for retryable errors
        if (shouldRetry && reconnectAttemptsRef.current < maxReconnectAttempts && isCallActive) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          setTimeout(() => {
            if (vapiRef.current) {
              retryConnection();
            }
          }, 2000 * reconnectAttemptsRef.current);
        } else if (!shouldRetry) {
          // For non-retryable errors, reset the call state
          setTimeout(() => {
            setCall(prev => ({ ...prev, status: 'idle' }));
            setError(null);
          }, 3000);
        }
      });

      // Volume and audio level monitoring
      vapi.on('volume-level', (levels: any) => {
        if (levels) {
          setAudioLevels({
            user: levels.user || 0,
            assistant: levels.assistant || 0,
            timestamp: new Date()
          });
        }
      });

      // Connection status monitoring
      vapi.on('connection-status', (status: string) => {
        console.log('🔗 Connection status:', status);
        switch (status) {
          case 'connected':
            setConnectionHealth('healthy');
            break;
          case 'connecting':
            setConnectionHealth('degraded');
            break;
          case 'disconnected':
            setConnectionHealth('failed');
            break;
        }
      });

      return () => {
        // Cleanup VAPI instance
        if (vapi) {
          vapi.stop();
          vapi.removeAllListeners();
        }
      };

    } catch (initError) {
      console.error('Failed to initialize VAPI:', initError);
      setError('Failed to initialize voice assistant');
      setConnectionHealth('failed');
    }
  }, []);

  // Handle function calls from the assistant
  const handleFunctionCall = useCallback((functionCall: any) => {
    try {
      const { name, parameters } = functionCall;
      
      switch (name) {
        case 'schedule_appointment':
          console.log('📅 Scheduling appointment:', parameters);
          // Handle appointment scheduling
          break;
        case 'emergency_triage':
          console.log('🚨 Emergency triage:', parameters);
          if (DentalService.initialize()) {
            DentalService.handleEmergency(parameters.symptoms || '');
          }
          break;
        case 'patient_verification':
          console.log('🔍 Patient verification:', parameters);
          // Handle patient verification
          break;
        default:
          console.log('🔧 Unknown function call:', name, parameters);
      }
    } catch (error) {
      console.error('Error handling function call:', error);
    }
  }, []);

  // Enhanced start call with proper configuration
  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      setError('Voice assistant not initialized');
      return;
    }

    if (isCallActive) {
      console.warn('Call already active');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTranscript([]);
      setConnectionHealth('healthy');
      reconnectAttemptsRef.current = 0;
      
      // Validate credentials before starting
      if (!VAPI_CONFIG.publicKey || !VAPI_CONFIG.assistantId) {
        throw new Error('VAPI credentials not configured');
      }
      
      // Enhanced start call configuration
      const callConfig = {
        // Enhanced assistant options
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-US'
        },
        voice: {
          provider: '11labs',
          voiceId: 'pNInz6obpgDQGcFmaJgB',
          stability: 0.5,
          similarityBoost: 0.8,
          style: 0.2
        },
        // Call settings
        recordingEnabled: false,
        maxDurationSeconds: 1800, // 30 minutes max
        backgroundSound: 'off',
        // Response timing
        responseDelaySeconds: 0.4,
        // Conversation settings
        silenceTimeoutSeconds: 30
      };
      
      console.log('🚀 Starting VAPI call with config:', { assistantId: VAPI_CONFIG.assistantId });
      await vapiRef.current.start(VAPI_CONFIG.assistantId, callConfig);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      console.error('Start call error:', err);
      setError(errorMessage);
      setIsLoading(false);
      setCall(prev => ({ ...prev, status: 'error' }));
      setConnectionHealth('failed');
    }
  }, [isCallActive]);

  // Enhanced end call
  const endCall = useCallback(() => {
    try {
      console.log('🛑 Ending VAPI call');
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      setIsCallActive(false);
      setIsLoading(false);
      // Don't clear error immediately if there was one
      if (!error) {
        setError(null);
      }
      setCall(prev => ({ 
        ...prev, 
        status: 'ended',
        endTime: new Date()
      }));
      
      // Reset to idle after delay
      setTimeout(() => {
        setCall(prev => ({ ...prev, status: 'idle' }));
        setError(null);
      }, 2000);
    } catch (err) {
      console.error('End call error:', err);
      setError('Error ending call');
    }
  }, [error]);

  // Enhanced retry connection
  const retryConnection = useCallback(async () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setError('Maximum reconnection attempts reached. Please try starting a new call.');
      setCall(prev => ({ ...prev, status: 'idle' }));
      return;
    }

    try {
      console.log('🔄 Retrying VAPI connection...');
      setError(null);
      setConnectionHealth('degraded');
      setIsLoading(true);
      
      // Stop any existing call first
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      await startCall();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      setError('Reconnection failed. Please try starting a new call.');
      setConnectionHealth('failed');
      setIsLoading(false);
    }
  }, [startCall]);

  // Mute/unmute functionality
  const toggleMute = useCallback(() => {
    if (vapiRef.current && isCallActive) {
      try {
        if (isMuted) {
          vapiRef.current.setMuted(false);
        } else {
          vapiRef.current.setMuted(true);
        }
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  }, [isMuted, isCallActive]);

  // Volume control
  const setCallVolume = useCallback((newVolume: number) => {
    if (vapiRef.current && isCallActive) {
      try {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        vapiRef.current.setVolume(clampedVolume);
        setVolume(clampedVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }, [isCallActive]);

  // Send message to assistant (for text input)
  const sendMessage = useCallback((message: string) => {
    if (vapiRef.current && isCallActive) {
      try {
        vapiRef.current.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: message
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, [isCallActive]);

  return {
    call,
    audioLevels,
    transcript,
    isLoading,
    error,
    connectionHealth,
    isCallActive,
    isMuted,
    volume,
    callStatus: call.status,
    startCall,
    endCall,
    retryConnection,
    toggleMute,
    setCallVolume,
    sendMessage
  };
};