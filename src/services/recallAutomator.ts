export interface RecallConfig {
  interval: number; // months
  autoBook: boolean;
  reminderDays: number[];
  priority: 'high' | 'medium' | 'low';
}

export interface PatientRecall {
  id: string;
  patientName: string;
  lastVisit: Date;
  procedure: string;
  nextDue: Date;
  status: 'due' | 'overdue' | 'scheduled' | 'contacted';
  contactAttempts: number;
  preferredContact: 'sms' | 'email' | 'call';
  estimatedRevenue: number;
}

export class RecallAutomator {
  private static recallConfigs: Record<string, RecallConfig> = {
    cleaning: { 
      interval: 6, 
      autoBook: true, 
      reminderDays: [30, 14, 7, 1],
      priority: 'medium'
    },
    crown: { 
      interval: 12, 
      autoBook: false, 
      reminderDays: [60, 30, 14],
      priority: 'low'
    },
    implant: { 
      interval: 24, 
      autoBook: true, 
      reminderDays: [90, 60, 30, 14],
      priority: 'high'
    },
    periodontal: {
      interval: 3,
      autoBook: true,
      reminderDays: [14, 7, 3, 1],
      priority: 'high'
    },
    filling: {
      interval: 24,
      autoBook: false,
      reminderDays: [60, 30, 14],
      priority: 'low'
    },
    extraction: {
      interval: 1,
      autoBook: true,
      reminderDays: [7, 3, 1],
      priority: 'high'
    }
  };

  private static patientRecalls: PatientRecall[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      lastVisit: new Date('2024-02-15'),
      procedure: 'cleaning',
      nextDue: new Date('2024-08-15'),
      status: 'overdue',
      contactAttempts: 2,
      preferredContact: 'sms',
      estimatedRevenue: 180
    },
    {
      id: '2',
      patientName: 'Mike Chen',
      lastVisit: new Date('2024-01-20'),
      procedure: 'crown',
      nextDue: new Date('2025-01-20'),
      status: 'due',
      contactAttempts: 0,
      preferredContact: 'email',
      estimatedRevenue: 1200
    },
    {
      id: '3',
      patientName: 'Emma Davis',
      lastVisit: new Date('2023-12-10'),
      procedure: 'periodontal',
      nextDue: new Date('2024-03-10'),
      status: 'overdue',
      contactAttempts: 3,
      preferredContact: 'call',
      estimatedRevenue: 350
    },
    {
      id: '4',
      patientName: 'John Smith',
      lastVisit: new Date('2024-07-01'),
      procedure: 'cleaning',
      nextDue: new Date('2025-01-01'),
      status: 'due',
      contactAttempts: 0,
      preferredContact: 'sms',
      estimatedRevenue: 180
    }
  ];

  static getRecallConfig(procedure: string): RecallConfig {
    return this.recallConfigs[procedure] || { 
      interval: 6, 
      autoBook: false, 
      reminderDays: [30, 14, 7],
      priority: 'medium'
    };
  }

  static getDueRecalls(): PatientRecall[] {
    const today = new Date();
    return this.patientRecalls.filter(recall => {
      const daysDiff = Math.floor((today.getTime() - recall.nextDue.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= -30; // Due within 30 days or overdue
    }).sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());
  }

  static getOverdueRecalls(): PatientRecall[] {
    const today = new Date();
    return this.patientRecalls.filter(recall => 
      recall.nextDue.getTime() < today.getTime()
    ).sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());
  }

  static async processRecallCampaign(): Promise<{
    contacted: number;
    scheduled: number;
    potentialRevenue: number;
    campaignResults: Array<{
      patientName: string;
      method: string;
      success: boolean;
      revenue: number;
    }>;
  }> {
    const dueRecalls = this.getDueRecalls();
    const campaignResults: Array<{
      patientName: string;
      method: string;
      success: boolean;
      revenue: number;
    }> = [];

    let contacted = 0;
    let scheduled = 0;
    let potentialRevenue = 0;

    for (const recall of dueRecalls) {
      if (recall.contactAttempts < 3) {
        const success = await this.contactPatient(recall);
        
        campaignResults.push({
          patientName: recall.patientName,
          method: recall.preferredContact,
          success,
          revenue: success ? recall.estimatedRevenue : 0
        });

        contacted++;
        
        if (success) {
          scheduled++;
          potentialRevenue += recall.estimatedRevenue;
          recall.status = 'scheduled';
        }
        
        recall.contactAttempts++;
      }
    }

    console.log(`📞 RECALL CAMPAIGN COMPLETE: ${contacted} contacted, ${scheduled} scheduled`);
    console.log(`💰 POTENTIAL REVENUE: $${potentialRevenue.toLocaleString()}`);

    return {
      contacted,
      scheduled,
      potentialRevenue,
      campaignResults
    };
  }

  private static async contactPatient(recall: PatientRecall): Promise<boolean> {
    const config = this.getRecallConfig(recall.procedure);
    
    // Simulate contact success rate based on method and priority
    const successRates = {
      sms: 0.75,
      email: 0.45,
      call: 0.65
    };

    const priorityMultiplier = {
      high: 1.2,
      medium: 1.0,
      low: 0.8
    };

    const baseSuccessRate = successRates[recall.preferredContact];
    const finalSuccessRate = Math.min(0.95, baseSuccessRate * priorityMultiplier[config.priority]);
    const success = Math.random() < finalSuccessRate;

    // Send appropriate message
    if (success) {
      await this.sendRecallMessage(recall);
    }

    return success;
  }

  private static async sendRecallMessage(recall: PatientRecall): Promise<void> {
    const config = this.getRecallConfig(recall.procedure);
    
    let message = `
🦷 ELITE DENTAL RECALL REMINDER

Hi ${recall.patientName}!

It's time for your ${recall.procedure} follow-up appointment.
`;

    if (recall.status === 'overdue') {
      message += `
⚠️ You're overdue for your ${recall.procedure} care.
Delaying treatment may lead to complications.
`;
    }

    if (config.autoBook) {
      message += `
📅 EASY BOOKING OPTIONS:
• Reply with preferred day/time
• Call (555) 123-DENTAL
• Book online: elite-dental.com/book

💰 Estimated cost: $${recall.estimatedRevenue}
🏥 Insurance accepted
`;
    } else {
      message += `
📞 Please call (555) 123-DENTAL to schedule
💰 Estimated cost: $${recall.estimatedRevenue}
`;
    }

    message += `
Thank you for trusting Elite Dental with your care!
    `.trim();

    console.log(`📱 Recall message sent to ${recall.patientName} via ${recall.preferredContact}:`, message);
  }

  static getRecallStats(): {
    totalDue: number;
    totalOverdue: number;
    potentialRevenue: number;
    byProcedure: Record<string, number>;
    contactSuccessRate: number;
  } {
    const dueRecalls = this.getDueRecalls();
    const overdueRecalls = this.getOverdueRecalls();
    
    const potentialRevenue = dueRecalls.reduce((sum, recall) => sum + recall.estimatedRevenue, 0);
    
    const byProcedure = dueRecalls.reduce((acc, recall) => {
      acc[recall.procedure] = (acc[recall.procedure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalContacts = this.patientRecalls.reduce((sum, recall) => sum + recall.contactAttempts, 0);
    const successfulContacts = this.patientRecalls.filter(recall => recall.status === 'scheduled').length;
    const contactSuccessRate = totalContacts > 0 ? (successfulContacts / totalContacts) * 100 : 0;

    return {
      totalDue: dueRecalls.length,
      totalOverdue: overdueRecalls.length,
      potentialRevenue,
      byProcedure,
      contactSuccessRate: Math.round(contactSuccessRate)
    };
  }

  static addPatientRecall(patientData: {
    patientName: string;
    procedure: string;
    lastVisit: Date;
    preferredContact: 'sms' | 'email' | 'call';
    estimatedRevenue?: number;
  }): void {
    const config = this.getRecallConfig(patientData.procedure);
    const nextDue = new Date(patientData.lastVisit);
    nextDue.setMonth(nextDue.getMonth() + config.interval);

    const newRecall: PatientRecall = {
      id: Date.now().toString(),
      patientName: patientData.patientName,
      lastVisit: patientData.lastVisit,
      procedure: patientData.procedure,
      nextDue,
      status: 'due',
      contactAttempts: 0,
      preferredContact: patientData.preferredContact,
      estimatedRevenue: patientData.estimatedRevenue || 200
    };

    this.patientRecalls.push(newRecall);
    console.log(`➕ Added recall for ${patientData.patientName}: ${patientData.procedure} due ${nextDue.toDateString()}`);
  }
}