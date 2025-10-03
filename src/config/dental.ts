// DENTAL PROCEDURE MAPPING with enhanced validation
export const procedureConfig = {
  cleaning: { 
    duration: 45, 
    providers: ['hygienist'], 
    cost: 120,
    description: 'Regular dental cleaning and examination',
    keywords: ['cleaning', 'hygiene', 'polish', 'scale']
  },
  emergency: { 
    priority: 'high', 
    keywords: ['pain', 'broken', 'urgent', 'swollen', 'bleeding', 'hurt', 'ache'],
    duration: 60,
    cost: 200,
    description: 'Emergency dental care'
  },
  surgery: { 
    duration: 120, 
    requires: ['xray'], 
    cost: 800,
    description: 'Oral surgery procedures',
    keywords: ['surgery', 'extraction', 'implant', 'oral surgery']
  },
  consultation: {
    duration: 30,
    providers: ['dentist'],
    cost: 80,
    description: 'Initial consultation',
    keywords: ['consultation', 'checkup', 'exam', 'evaluation']
  },
  filling: {
    duration: 60,
    providers: ['dentist'],
    cost: 150,
    description: 'Dental filling procedure',
    keywords: ['filling', 'cavity', 'restoration', 'decay']
  },
  crown: {
    duration: 90,
    providers: ['dentist'],
    cost: 1200,
    description: 'Dental crown procedure',
    keywords: ['crown', 'cap', 'cover', 'restoration']
  },
  periodontal: {
    duration: 75,
    providers: ['periodontist', 'hygienist'],
    cost: 350,
    description: 'Periodontal treatment',
    keywords: ['gum', 'periodontal', 'deep cleaning', 'scaling', 'root planing']
  }
} as const;

// PATIENT VERIFICATION with enhanced security
export const verificationFlow = {
  methods: ['phone', 'dob', 'email'],
  fallback: 'sms',
  hipaaCompliant: true,
  maxAttempts: 3,
  timeoutMinutes: 5,
  encryptionRequired: true,
  auditLog: true,
  biometricSupport: false // Future enhancement
} as const;

// RECALL SYSTEM with enhanced automation
export const recallSettings = {
  intervals: { 
    cleaning: 6, 
    perio: 3, 
    implant: 12,
    crown: 12,
    filling: 24,
    surgery: 1,
    consultation: 12,
    periodontal: 3
  },
  autoBook: true,
  reminderDays: [30, 14, 7, 1],
  methods: ['sms', 'email', 'call'],
  maxAttempts: 5,
  escalationRules: {
    overdue30Days: 'call',
    overdue60Days: 'priority_call',
    overdue90Days: 'certified_mail'
  }
} as const;

// EMERGENCY TRIAGE PROTOCOL with enhanced keywords
export const emergencyKeywords = [
  'pain', 'emergency', 'broken', 'swollen', 'bleeding', 
  'urgent', 'hurt', 'ache', 'throbbing', 'severe',
  'unbearable', 'excruciating', 'can\'t sleep', 'can\'t eat',
  'knocked out', 'chipped', 'cracked', 'loose tooth',
  'abscess', 'infection', 'pus', 'fever'
] as const;

// PAIN LEVEL ASSESSMENT
export const painLevelKeywords = {
  severe: ['unbearable', 'excruciating', 'worst', 'can\'t', 'crying', '10/10', 'screaming'],
  moderate: ['bad', 'hurts', 'painful', 'aching', 'throbbing', 'uncomfortable', '6/10', '7/10'],
  mild: ['slight', 'little', 'minor', 'uncomfortable', 'tender', '3/10', '4/10']
} as const;

// HIPAA COMPLIANCE SETTINGS with enhanced security
export const hipaaConfig = {
  redactionRules: [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replace: '[SSN-REDACTED]' },
    { pattern: /\b\d{9}\b/g, replace: '[SSN-REDACTED]' },
    { pattern: /\b[A-Z]{2}\d{10}\b/g, replace: '[INSURANCE-REDACTED]' },
    { pattern: /\b[A-Z]{3}\d{9}\b/g, replace: '[INSURANCE-REDACTED]' },
    { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, replace: '[PHONE-REDACTED]' },
    { pattern: /\b\(\d{3}\)\s?\d{3}-\d{4}\b/g, replace: '[PHONE-REDACTED]' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replace: '[CARD-REDACTED]' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replace: '[EMAIL-REDACTED]' },
    { pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, replace: '[DOB-REDACTED]' },
    { pattern: /\b\d{1,2}-\d{1,2}-\d{4}\b/g, replace: '[DOB-REDACTED]' },
    { pattern: /\bMRN[\s:]?\d+/gi, replace: '[MRN-REDACTED]' },
    { pattern: /\bMR[\s:]?\d+/gi, replace: '[MRN-REDACTED]' }
  ],
  encryption: 'AES-256-GCM',
  dataRetention: 7, // years
  auditLog: true,
  accessControls: 'role-based-mfa',
  backupEncryption: true,
  transmissionSecurity: 'TLS-1.3',
  anonymizationLevel: 'full'
} as const;

// BUSINESS HOURS AND AVAILABILITY
export const businessConfig = {
  hours: {
    monday: { open: '08:00', close: '18:00' },
    tuesday: { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' },
    thursday: { open: '08:00', close: '18:00' },
    friday: { open: '08:00', close: '17:00' },
    saturday: { open: '09:00', close: '14:00' },
    sunday: { open: null, close: null } // Closed
  },
  emergencyHours: '24/7',
  timeZone: 'America/New_York',
  appointmentSlots: 15, // minutes
  bufferTime: 10 // minutes between appointments
} as const;

// INSURANCE VERIFICATION
export const insuranceConfig = {
  supportedProviders: [
    'Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'Blue Cross Blue Shield',
    'Humana', 'Guardian', 'Principal', 'United Healthcare', 'Anthem'
  ],
  verificationMethods: ['real-time', 'batch', 'manual'],
  requiredFields: ['memberId', 'groupNumber', 'subscriberName', 'dateOfBirth'],
  eligibilityCheck: true,
  benefitsVerification: true,
  preAuthRequired: ['surgery', 'orthodontics', 'periodontal']
} as const;

// APPOINTMENT TYPES AND SCHEDULING
export const appointmentConfig = {
  types: {
    emergency: { priority: 1, maxWait: 2, color: '#ef4444' },
    newPatient: { priority: 2, maxWait: 24, color: '#f59e0b' },
    followUp: { priority: 3, maxWait: 72, color: '#10b981' },
    routine: { priority: 4, maxWait: 168, color: '#3b82f6' },
    consultation: { priority: 3, maxWait: 48, color: '#8b5cf6' }
  },
  bufferRules: {
    beforeSurgery: 30, // minutes
    afterSurgery: 15,
    betweenPatients: 10,
    lunchBreak: 60
  },
  cancellationPolicy: {
    minimumNotice: 24, // hours
    feeThreshold: 2, // hours before appointment
    emergencyExceptions: true
  }
} as const;

// COMMUNICATION PREFERENCES
export const communicationConfig = {
  channels: {
    sms: { enabled: true, priority: 1, costPerMessage: 0.02 },
    email: { enabled: true, priority: 2, costPerMessage: 0.001 },
    voice: { enabled: true, priority: 3, costPerMessage: 0.15 },
    push: { enabled: false, priority: 4, costPerMessage: 0 }
  },
  templates: {
    appointment_confirmation: 'Your appointment with {clinicName} is confirmed for {date} at {time}.',
    appointment_reminder: 'Reminder: You have an appointment tomorrow at {time} with {clinicName}.',
    emergency_response: 'Emergency appointment scheduled. Please arrive at {time}. Call {phone} if needed.',
    recall_notice: 'It\'s time for your {procedure} appointment. Call {phone} to schedule.',
    cancellation_notice: 'Your appointment on {date} has been cancelled. Please call to reschedule.'
  },
  personalization: true,
  languageSupport: ['en', 'es', 'fr'], // English, Spanish, French
  accessibilityFeatures: ['screen-reader', 'high-contrast', 'large-text']
} as const;

// QUALITY ASSURANCE AND MONITORING
export const qualityConfig = {
  metrics: {
    responseTime: { target: 2000, warning: 5000, critical: 10000 }, // milliseconds
    accuracy: { target: 95, warning: 90, critical: 85 }, // percentage
    availability: { target: 99.9, warning: 99, critical: 95 }, // percentage
    patientSatisfaction: { target: 4.5, warning: 4.0, critical: 3.5 } // out of 5
  },
  monitoring: {
    errorTracking: true,
    performanceMonitoring: true,
    userBehaviorAnalytics: false, // HIPAA compliance
    systemHealthChecks: true,
    alertThresholds: {
      errorRate: 5, // percentage
      responseTime: 5000, // milliseconds
      memoryUsage: 80 // percentage
    }
  },
  testing: {
    unitTests: true,
    integrationTests: true,
    e2eTests: true,
    accessibilityTests: true,
    performanceTests: true,
    securityTests: true
  }
} as const;

// INTEGRATION ENDPOINTS
export const integrationConfig = {
  apis: {
    practiceManagement: {
      endpoint: '/api/pms',
      authentication: 'oauth2',
      rateLimit: 100, // requests per minute
      timeout: 30000 // milliseconds
    },
    insurance: {
      endpoint: '/api/insurance',
      authentication: 'api-key',
      rateLimit: 50,
      timeout: 15000
    },
    sms: {
      endpoint: '/api/sms',
      authentication: 'bearer-token',
      rateLimit: 200,
      timeout: 10000
    },
    email: {
      endpoint: '/api/email',
      authentication: 'smtp',
      rateLimit: 100,
      timeout: 20000
    }
  },
  webhooks: {
    appointmentBooked: '/webhooks/appointment-booked',
    appointmentCancelled: '/webhooks/appointment-cancelled',
    emergencyTriggered: '/webhooks/emergency-triggered',
    paymentProcessed: '/webhooks/payment-processed'
  },
  security: {
    encryption: 'AES-256-GCM',
    tokenExpiry: 3600, // seconds
    refreshTokenExpiry: 86400, // seconds
    rateLimiting: true,
    ipWhitelisting: false,
    corsOrigins: ['https://*.dental', 'https://*.dentist']
  }
} as const;

// Type definitions for better TypeScript support
export type ProcedureType = keyof typeof procedureConfig;
export type EmergencyKeyword = typeof emergencyKeywords[number];
export type PainLevel = keyof typeof painLevelKeywords;
export type AppointmentType = keyof typeof appointmentConfig.types;
export type CommunicationChannel = keyof typeof communicationConfig.channels;