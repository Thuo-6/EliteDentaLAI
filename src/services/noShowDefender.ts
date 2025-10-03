import { DentalService } from './dentalService';

export interface NoShowDefenderConfig {
  reminders: {
    sms: { '24h': boolean; '2h': boolean };
    voice: { '1h': boolean };
  };
  waitlist: {
    autoFill: boolean;
    priority: string[];
  };
}

export interface WaitlistPatient {
  id: string;
  name: string;
  phone: string;
  preferredTimes: string[];
  priority: 'emergency' | 'new_patient' | 'regular';
  addedAt: Date;
}

export class NoShowDefender {
  private static config: NoShowDefenderConfig = {
    reminders: {
      sms: { '24h': true, '2h': true },
      voice: { '1h': true }
    },
    waitlist: {
      autoFill: true,
      priority: ["emergency", "new_patient", "regular"]
    }
  };

  private static waitlist: WaitlistPatient[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      phone: '555-0123',
      preferredTimes: ['morning', 'afternoon'],
      priority: 'emergency',
      addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2', 
      name: 'Mike Chen',
      phone: '555-0456',
      preferredTimes: ['afternoon'],
      priority: 'new_patient',
      addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: '3',
      name: 'Emma Davis',
      phone: '555-0789',
      preferredTimes: ['morning'],
      priority: 'regular',
      addedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ];

  static async handleCancellation(appointmentSlot: string): Promise<{
    filled: boolean;
    patient?: WaitlistPatient;
    revenueRecovered: number;
  }> {
    console.log(`🚨 CANCELLATION DETECTED: ${appointmentSlot}`);
    
    if (!this.config.waitlist.autoFill) {
      return { filled: false, revenueRecovered: 0 };
    }

    // Sort waitlist by priority and time added
    const sortedWaitlist = this.waitlist.sort((a, b) => {
      const priorityOrder = { emergency: 0, new_patient: 1, regular: 2 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.addedAt.getTime() - b.addedAt.getTime();
    });

    // Try to fill the slot
    for (const patient of sortedWaitlist) {
      const timeSlot = appointmentSlot.toLowerCase();
      const patientAvailable = patient.preferredTimes.some(time => 
        timeSlot.includes(time)
      );

      if (patientAvailable) {
        // Remove from waitlist
        this.waitlist = this.waitlist.filter(p => p.id !== patient.id);
        
        // Send confirmation SMS
        await this.sendConfirmationSMS(patient, appointmentSlot);
        
        // Calculate revenue recovered (average appointment value)
        const revenueRecovered = this.calculateRevenueRecovered(appointmentSlot);
        
        console.log(`✅ SLOT FILLED: ${patient.name} booked for ${appointmentSlot}`);
        console.log(`💰 REVENUE RECOVERED: $${revenueRecovered}`);
        
        return { 
          filled: true, 
          patient, 
          revenueRecovered 
        };
      }
    }

    return { filled: false, revenueRecovered: 0 };
  }

  private static async sendConfirmationSMS(patient: WaitlistPatient, slot: string): Promise<void> {
    const message = `
🦷 ELITE DENTAL - APPOINTMENT AVAILABLE!

Hi ${patient.name}! A ${slot} appointment just opened up.

📅 Your slot is CONFIRMED
📱 Reply CONFIRM to secure
📞 Call (555) 123-DENTAL for changes

Thank you for choosing Elite Dental!
    `.trim();

    console.log(`📱 SMS sent to ${patient.phone}:`, message);
    // SMS service integration would go here
  }

  private static calculateRevenueRecovered(slot: string): number {
    // Average appointment values by time slot
    const slotValues = {
      'morning': 380,
      'afternoon': 420,
      'evening': 350,
      'emergency': 580
    };

    for (const [timeType, value] of Object.entries(slotValues)) {
      if (slot.toLowerCase().includes(timeType)) {
        return value;
      }
    }

    return 400; // Default average
  }

  static getWaitlistStats(): {
    total: number;
    byPriority: Record<string, number>;
    averageWaitTime: number;
  } {
    const byPriority = this.waitlist.reduce((acc, patient) => {
      acc[patient.priority] = (acc[patient.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageWaitTime = this.waitlist.length > 0 
      ? this.waitlist.reduce((sum, patient) => {
          return sum + (Date.now() - patient.addedAt.getTime());
        }, 0) / this.waitlist.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total: this.waitlist.length,
      byPriority,
      averageWaitTime: Math.round(averageWaitTime * 10) / 10
    };
  }

  static addToWaitlist(patient: Omit<WaitlistPatient, 'id' | 'addedAt'>): void {
    const newPatient: WaitlistPatient = {
      ...patient,
      id: Date.now().toString(),
      addedAt: new Date()
    };
    
    this.waitlist.push(newPatient);
    console.log(`➕ Added to waitlist: ${patient.name} (${patient.priority})`);
  }

  // Simulate cancellations for demo
  static simulateCancellation(): void {
    const slots = [
      'Tomorrow 10:00 AM - Cleaning',
      'Today 2:30 PM - Consultation', 
      'Tomorrow 9:00 AM - Emergency'
    ];
    
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    this.handleCancellation(randomSlot);
  }
}