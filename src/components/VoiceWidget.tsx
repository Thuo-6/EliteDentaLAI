import React, { useEffect, useRef, useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  Send,
  Coffee,
  Heart,
  Sparkles,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useVapi } from '../hooks/useVapi';
import { AnimatedDentalIcon } from './AnimatedDentalIcon';

export const VoiceWidget = () => {
  const { 
    call,
    isLoading, 
    transcript, 
    startCall, 
    endCall,
    error,
    connectionHealth,
    retryConnection,
    isCallActive,
    isMuted,
    volume,
    toggleMute,
    setCallVolume,
    sendMessage,
    audioLevels
  } = useVapi();

  const [isMinimized, setIsMinimized] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [showTextInput, setShowTextInput] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [showDonation, setShowDonation] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-minimize after inactivity (disabled during calls)
  useEffect(() => {
    if (isCallActive) return; // Don't minimize during active calls
    
    const checkInactivity = () => {
      if (Date.now() - lastInteraction > 45000 && !isCallActive) {
        setIsMinimized(true);
      }
    };

    const interval = setInterval(checkInactivity, 5000);
    return () => clearInterval(interval);
  }, [lastInteraction, isCallActive]);

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  const handleCallToggle = () => {
    setLastInteraction(Date.now());
    if (isCallActive) {
      endCall();
    } else {
      startCall();
    }
  };

  const handleWidgetClick = () => {
    setLastInteraction(Date.now());
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const handleSendMessage = () => {
    if (textMessage.trim() && isCallActive) {
      sendMessage(textMessage.trim());
      setTextMessage('');
      setShowTextInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasError = error || connectionHealth === 'failed';

  const donationOptions = [
    {
      name: 'Binance Pay',
      id: '86664780',
      type: 'binance',
      icon: '🟡',
      description: 'Binance ID'
    },
    {
      name: 'M-Pesa Mobile Money',
      id: '0727990477',
      type: 'mpesa',
      icon: '📱',
      description: 'Kenya Mobile Payment'
    },
    {
      name: 'USDT (Tron)',
      address: 'TVi5L1eoLywjEqMYhw21nGAmREY8Cac9qJ',
      type: 'usdt',
      icon: '💚',
      description: 'TRC20 Network'
    },
    {
      name: 'Ethereum',
      address: '0xcffeefd6fa4e67f96a390498e59913ab0edb51df',
      type: 'eth',
      icon: '🔷',
      description: 'ERC20 Network'
    },
    {
      name: 'Bitcoin/BNB',
      address: '0xcffeefd6fa4e67f96a390498e59913ab0edb51df',
      type: 'bnb',
      icon: '🟠',
      description: 'BEP20 SmartChain'
    },
    {
      name: 'Solana',
      address: '9pGwHNjck5GamJ4H5LfZAesLGRUCfnZF1crUbipHuG4i',
      type: 'sol',
      icon: '🟣',
      description: 'Case-sensitive'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Donation Modal */}
      {showDonation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#89CFF0]/20 p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Support Continued Development</h3>
                  <p className="text-sm text-gray-600">Buy me a coffee ☕</p>
                </div>
              </div>
              <button
                onClick={() => setShowDonation(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Thank you for your support!</span>
              </div>
              <p className="text-xs text-gray-600">
                If this Elite Dental AI Widget helps your business, consider supporting continued development and improvements.
              </p>
            </div>

            <div className="space-y-3">
              {donationOptions.map((option) => (
                <div key={option.type} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#89CFF0]/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{option.name}</h4>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(option.address || option.id || '', option.type)}
                      className="flex items-center gap-1 px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-xs"
                    >
                      {copiedAddress === option.type ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <code className="text-xs text-gray-700 break-all font-mono">
                      {option.address || option.id}
                    </code>
                  </div>
                  {option.type === 'sol' && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      ⚠️ Case-sensitive - copy exactly as shown
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Your support helps maintain and improve this free tool for dental practices worldwide.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized ? (
        <div 
          onClick={handleWidgetClick}
          className="group relative w-20 h-20 bg-gradient-to-br from-[#89CFF0] via-[#87CEEB] to-[#F0FFFF] rounded-full shadow-2xl cursor-pointer transform hover:scale-110 transition-all duration-500 flex items-center justify-center border-4 border-white/30 backdrop-blur-sm"
        >
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#F0FFFF] animate-ping opacity-20"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#F0FFFF] animate-pulse opacity-30"></div>
          
          <AnimatedDentalIcon className="w-10 h-10 relative z-10" isActive={isCallActive} />
          
          {/* Status indicators */}
          {isCallActive && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-3 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-3 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}

          {/* Floating sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-sparkle opacity-60"
                style={{
                  left: `${20 + (i * 25)}%`,
                  top: `${15 + (i * 20)}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${2 + (i * 0.3)}s`
                }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Full Widget */
        <div 
          ref={widgetRef}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#89CFF0]/20 p-6 w-96 mb-4 transform transition-all duration-700 hover:shadow-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(137, 207, 240, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#89CFF0] via-[#87CEEB] to-[#F0FFFF] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#89CFF0]/20 to-[#F0FFFF]/20 animate-pulse"></div>
                <AnimatedDentalIcon className="w-9 h-9 relative z-10" isActive={isCallActive} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-xl bg-gradient-to-r from-[#89CFF0] to-[#87CEEB] bg-clip-text text-transparent">
                  Elite Dental
                </h3>
                <p className="text-sm text-gray-600 font-medium">AI Voice Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDonation(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                title="Support Development"
              >
                <Coffee className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <span className="text-gray-500 text-sm font-bold">−</span>
              </button>
            </div>
          </div>

          {/* Enhanced Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">Connection Status:</span>
              <div className="flex items-center gap-3">
                {hasError ? (
                  <WifiOff className="w-5 h-5 text-red-500" />
                ) : (
                  <Wifi className="w-5 h-5 text-green-500" />
                )}
                <div className={`w-3 h-3 rounded-full ${
                  hasError ? 'bg-red-500' :
                  isCallActive ? 'bg-green-500 animate-pulse' :
                  isLoading ? 'bg-yellow-500 animate-pulse' :
                  'bg-blue-500'
                }`} />
                <span className={`text-sm px-4 py-2 rounded-full font-semibold ${
                  hasError ? 'bg-red-100 text-red-700' :
                  isCallActive ? 'bg-green-100 text-green-700' :
                  isLoading ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {hasError ? 'Connection Error' : call.status || 'Ready'}
                </span>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-3 border border-red-100">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={retryConnection}
                    className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Audio Levels */}
            {isCallActive && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Mic className="w-4 h-4 text-blue-500" />
                    <span className="w-16 text-xs font-medium">Your Voice</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${Math.min(100, (audioLevels.user || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Volume2 className="w-4 h-4 text-green-500" />
                    <span className="w-16 text-xs font-medium">Assistant</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${Math.min(100, (audioLevels.assistant || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Instructions */}
          {!isCallActive && !hasError && (
            <div className="mb-6 p-5 bg-gradient-to-br from-[#F0FFFF]/40 via-[#F0FFFF]/30 to-[#89CFF0]/10 rounded-2xl border border-[#89CFF0]/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-[#F0FFFF] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <AnimatedDentalIcon className="w-8 h-8" isActive={false} />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">🦷 Elite Dental AI Assistant</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Click the call button to start scheduling your dental appointment, ask questions, or get emergency triage assistance.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>HIPAA Compliant • 24/7 Available</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Controls */}
          <div className="flex justify-center gap-4 mb-6">
            {/* Main Call Button */}
            <div className="relative">
              <button
                onClick={handleCallToggle}
                disabled={isLoading}
                className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl ${
                  isCallActive
                    ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800'
                    : hasError
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#89CFF0] via-[#87CEEB] to-[#F0FFFF] hover:from-[#89CFF0]/90 hover:via-[#87CEEB]/90 hover:to-[#F0FFFF]/90'
                } ${isLoading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                {/* Pulsing ring for active calls */}
                {isCallActive && (
                  <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
                )}
                
                {/* Loading spinner */}
                {isLoading && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
                )}
                
                {isCallActive ? (
                  <PhoneOff className="w-8 h-8 text-white relative z-10" />
                ) : (
                  <Phone className="w-8 h-8 text-white relative z-10" />
                )}
              </button>
              
              {/* Call duration indicator */}
              {isCallActive && call.startTime && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-mono bg-white/80 px-2 py-1 rounded-full">
                  {Math.floor((Date.now() - call.startTime.getTime()) / 1000)}s
                </div>
              )}
            </div>

            {/* Additional Controls when active */}
            {isCallActive && (
              <>
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                    isMuted 
                      ? 'bg-gradient-to-br from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Message Button */}
                <button
                  onClick={() => setShowTextInput(!showTextInput)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                    showTextInput
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 hover:from-blue-200 hover:to-blue-300'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Enhanced Text Input */}
          {showTextInput && isCallActive && (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
              <div className="flex gap-3">
                <input
                  ref={textInputRef}
                  type="text"
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message to the assistant..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-[#89CFF0] transition-all duration-300"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!textMessage.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-[#89CFF0] to-[#87CEEB] text-white rounded-xl hover:from-[#89CFF0]/90 hover:to-[#87CEEB]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Volume Control */}
          {isCallActive && (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4">
                <VolumeX className="w-5 h-5 text-gray-500" />
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setCallVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
                <Volume2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 w-8">{Math.round(volume * 100)}</span>
              </div>
            </div>
          )}

          {/* Enhanced Live Transcript */}
          {transcript.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white/90 backdrop-blur-sm py-2 -mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h4 className="text-sm font-bold text-gray-700">Live Transcript</h4>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>
              {transcript.slice(-4).map((entry, index) => (
                <div key={entry.id || index} className={`p-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] ${
                  entry.speaker === 'user' 
                    ? 'bg-gradient-to-r from-[#89CFF0]/10 to-[#87CEEB]/10 text-gray-800 ml-6 border-l-4 border-[#89CFF0]' 
                    : 'bg-gradient-to-r from-[#F0FFFF]/40 to-[#FAF9F6]/40 text-gray-700 mr-6 border-l-4 border-green-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      {entry.speaker === 'user' ? (
                        <>
                          <div className="w-6 h-6 bg-[#89CFF0] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">👤</span>
                          </div>
                          You
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">🤖</span>
                          </div>
                          Assistant
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {entry.timestamp?.toLocaleTimeString() || 'Unknown time'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{entry.text}</p>
                  {entry.confidence && entry.confidence < 0.8 && (
                    <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      ⚠️ Low confidence transcription
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes float-sparkle {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
        }
        
        .animate-float-sparkle {
          animation: float-sparkle 3s ease-in-out infinite;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #89CFF0, #87CEEB);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #89CFF0, #87CEEB);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};