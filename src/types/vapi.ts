export interface VapiCall {
  id: string;
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
  transcript?: string;
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
}

export interface AudioLevel {
  user: number;
  assistant: number;
  timestamp?: Date;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  confidence?: number;
  redacted?: boolean;
}

export interface VapiConfig {
  publicKey: string;
  assistantId: string;
  hipaaCompliant: boolean;
  maxRetries: number;
  timeoutMs: number;
}

export interface VapiError {
  code: string;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface VapiMessage {
  type: 'transcript' | 'function-call' | 'conversation-update' | 'tool-calls' | 'speech-update';
  role?: 'user' | 'assistant' | 'system';
  transcript?: string;
  text?: string;
  confidence?: number;
  functionCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface VapiAssistantOptions {
  transcriber?: {
    provider: 'deepgram' | 'assembly-ai' | 'gladia';
    model?: string;
    language?: string;
    smartFormat?: boolean;
    keywords?: string[];
  };
  voice?: {
    provider: 'elevenlabs' | 'playht' | 'rime-ai' | 'azure';
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    speed?: number;
  };
  model?: {
    provider: 'openai' | 'anthropic' | 'together-ai';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemMessage?: string;
    functions?: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>;
  };
  recordingEnabled?: boolean;
  hipaaCompliant?: boolean;
  silenceTimeoutSeconds?: number;
  responseDelaySeconds?: number;
  interruptionThreshold?: number;
  backgroundSound?: 'office' | 'none';
  endCallMessage?: string;
  voicemailMessage?: string;
}