// PRODUCTION HOTFIX: Direct VAPI integration with hardcoded keys for testing
const VAPI_PUBLIC_KEY = "3c016063-003f-482f-9ea3-40b50c02d546";
const ASSISTANT_ID = "1d07df21-4bef-48e8-a092-6ff324eb8b52";

// Import VAPI SDK
import Vapi from '@vapi-ai/web';
import { EmergencyTriage } from './services/emergencyTriage';
import { HIPAAShield } from './services/hipaaShield';

// Initialize Voice Assistant with production configuration
export const initVoiceAssistant = () => {
  try {
    console.log('🦷 Initializing Elite Dental Voice Assistant...');
    
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    
    // Dental-specific configuration
    vapi.on('call-start', () => {
      console.log('📞 Voice call started - Elite Dental Assistant active');
    });
    
    vapi.on('call-end', () => {
      console.log('📞 Voice call ended - Thank you for using Elite Dental');
    });
    
    vapi.on('speech-start', () => {
      console.log('🎤 Patient is speaking...');
    });
    
    vapi.on('speech-end', () => {
      console.log('🎤 Patient finished speaking');
    });
    
    vapi.on('message', (message) => {
      console.log('💬 Message received:', message);
      
      // Emergency detection
      if (message.type === 'transcript' && message.role === 'user') {
        // HIPAA-compliant redaction
        const redactionResult = HIPAAShield.redactPHI(message.transcript);
        console.log('🛡️ HIPAA Shield:', redactionResult);
        
        // Emergency triage
        EmergencyTriage.handleEmergencyUtterance(redactionResult.redactedText);
      }
    });
    
    vapi.on('error', (error) => {
      console.error('❌ VAPI Error:', error);
      fallbackToSMS();
    });
    
    return vapi;
    
  } catch (error) {
    console.error('❌ Failed to initialize VAPI:', error);
    return null;
  }
};

// SMS fallback for accessibility
const fallbackToSMS = () => {
  console.log('📱 Falling back to SMS verification');
  // SMS integration would go here
};

// Start voice call function
export const startVoiceCall = (vapi) => {
  if (!vapi) {
    console.error('❌ VAPI not initialized');
    return false;
  }
  
  try {
    vapi.start(ASSISTANT_ID);
    return true;
  } catch (error) {
    console.error('❌ Failed to start call:', error);
    return false;
  }
};

// End voice call function
export const endVoiceCall = (vapi) => {
  if (vapi) {
    vapi.stop();
  }
};