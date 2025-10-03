export interface EmergencyBooking {
  type: 'URGENT';
  maxWait: number; // hours
  patientInfo: {
    symptoms: string;
    painLevel: number;
    contactMethod: 'sms' | 'call';
  };
  appointmentTime: Date;
}

export class EmergencyTriage {
  private static emergencyKeywords = [
    'pain', 'broken', 'emergency', 'swollen', 'bleeding',
    'urgent', 'hurt', 'ache', 'throbbing', 'severe',
    'unbearable', 'excruciating', 'can\'t sleep', 'can\'t eat'
  ];

  private static painLevelKeywords = {
    severe: ['unbearable', 'excruciating', 'worst', 'can\'t', 'crying'],
    moderate: ['bad', 'hurts', 'painful', 'aching', 'throbbing'],
    mild: ['slight', 'little', 'minor', 'uncomfortable']
  };

  static analyzeEmergency(utterance: string): {
    isEmergency: boolean;
    painLevel: number;
    symptoms: string[];
    urgencyScore: number;
  } {
    const lowerUtterance = utterance.toLowerCase();
    
    // Check for emergency keywords
    const foundKeywords = this.emergencyKeywords.filter(keyword =>
      lowerUtterance.includes(keyword)
    );

    const isEmergency = foundKeywords.length > 0;
    
    if (!isEmergency) {
      return { isEmergency: false, painLevel: 0, symptoms: [], urgencyScore: 0 };
    }

    // Determine pain level (1-10 scale)
    let painLevel = 5; // default moderate
    
    if (this.painLevelKeywords.severe.some(word => lowerUtterance.includes(word))) {
      painLevel = 9;
    } else if (this.painLevelKeywords.moderate.some(word => lowerUtterance.includes(word))) {
      painLevel = 6;
    } else if (this.painLevelKeywords.mild.some(word => lowerUtterance.includes(word))) {
      painLevel = 3;
    }

    // Calculate urgency score (0-100)
    let urgencyScore = foundKeywords.length * 15;
    urgencyScore += painLevel * 8;
    
    // Time-sensitive keywords boost urgency
    if (lowerUtterance.includes('since last night') || lowerUtterance.includes('all night')) {
      urgencyScore += 20;
    }
    
    urgencyScore = Math.min(urgencyScore, 100);

    return {
      isEmergency: true,
      painLevel,
      symptoms: foundKeywords,
      urgencyScore
    };
  }

  static async bookEmergencyAppointment(analysis: ReturnType<typeof EmergencyTriage.analyzeEmergency>): Promise<EmergencyBooking> {
    const appointmentTime = new Date();
    
    // High urgency: within 2 hours
    // Medium urgency: within 6 hours  
    // Lower urgency: within 24 hours
    const hoursToAdd = analysis.urgencyScore > 80 ? 2 : 
                      analysis.urgencyScore > 50 ? 6 : 24;
    
    appointmentTime.setHours(appointmentTime.getHours() + hoursToAdd);

    const booking: EmergencyBooking = {
      type: 'URGENT',
      maxWait: hoursToAdd,
      patientInfo: {
        symptoms: analysis.symptoms.join(', '),
        painLevel: analysis.painLevel,
        contactMethod: analysis.urgencyScore > 70 ? 'call' : 'sms'
      },
      appointmentTime
    };

    // Send immediate triage guide
    await this.sendSMSTriageGuide(analysis);
    
    console.log(`🚨 EMERGENCY BOOKED: ${hoursToAdd}h wait, Pain Level: ${analysis.painLevel}/10`);
    
    return booking;
  }

  private static async sendSMSTriageGuide(analysis: ReturnType<typeof EmergencyTriage.analyzeEmergency>): Promise<void> {
    let triageMessage = `
🚨 ELITE DENTAL EMERGENCY RESPONSE

Your emergency appointment is CONFIRMED.

IMMEDIATE CARE INSTRUCTIONS:
`;

    // Pain-specific guidance
    if (analysis.painLevel >= 7) {
      triageMessage += `
🔴 SEVERE PAIN PROTOCOL:
• Take 600mg ibuprofen + 500mg acetaminophen
• Apply cold compress 15min on/off
• Avoid hot/cold foods
• Sleep with head elevated
`;
    } else if (analysis.painLevel >= 4) {
      triageMessage += `
🟡 MODERATE PAIN PROTOCOL:
• Take 400mg ibuprofen every 6 hours
• Rinse with warm salt water
• Avoid chewing on affected side
`;
    }

    // Symptom-specific guidance
    if (analysis.symptoms.includes('swollen')) {
      triageMessage += `
🔵 SWELLING PROTOCOL:
• Apply ice pack to face (not directly on skin)
• Keep head elevated when lying down
• Avoid hot compresses
`;
    }

    if (analysis.symptoms.includes('bleeding')) {
      triageMessage += `
🔴 BLEEDING PROTOCOL:
• Apply gentle pressure with clean gauze
• Avoid spitting or rinsing vigorously
• If bleeding doesn't stop in 30min, call immediately
`;
    }

    triageMessage += `
📞 EMERGENCY HOTLINE: (555) 123-DENTAL
⏰ Your appointment: ${analysis.urgencyScore > 80 ? 'Within 2 hours' : 'Within 24 hours'}

Elite Dental - We're here for you 24/7
    `.trim();

    console.log('📱 Emergency SMS Triage Guide sent:', triageMessage);
    // SMS service integration would go here
  }

  static handleEmergencyUtterance(utterance: string): boolean {
    const analysis = this.analyzeEmergency(utterance);
    
    if (analysis.isEmergency) {
      this.bookEmergencyAppointment(analysis);
      return true;
    }
    
    return false;
  }
}