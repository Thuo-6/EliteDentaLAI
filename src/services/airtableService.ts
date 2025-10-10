// Airtable Integration Service for Elite Dental AI Widget
// Manages patient bookings, treatment schedules, and clinic data

export interface PatientRecord {
  id?: string;
  patientName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  preferredContactMethod: 'sms' | 'email' | 'call';
  createdAt?: string;
  updatedAt?: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface AppointmentRecord {
  id?: string;
  patientId: string;
  patientName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  procedure: string;
  provider: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  priority: 'routine' | 'urgent' | 'emergency';
  notes?: string;
  symptoms?: string;
  painLevel?: number;
  estimatedCost?: number;
  insuranceCovered?: boolean;
  remindersSent?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy: 'ai-assistant' | 'staff' | 'patient';
}

export interface TreatmentPlan {
  id?: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  recommendedTreatments: string[];
  estimatedCost: number;
  estimatedDuration: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'proposed' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
  createdDate: string;
  targetCompletionDate?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface WaitlistRecord {
  id?: string;
  patientName: string;
  phone: string;
  email?: string;
  preferredDates: string[];
  preferredTimes: string[];
  procedure: string;
  priority: 'emergency' | 'new_patient' | 'regular';
  maxWaitDays: number;
  addedDate: string;
  contactAttempts: number;
  lastContactDate?: string;
  status: 'active' | 'contacted' | 'scheduled' | 'expired';
  notes?: string;
}

export interface RecallRecord {
  id?: string;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  lastVisitDate: string;
  lastProcedure: string;
  nextDueDate: string;
  recallType: 'cleaning' | 'checkup' | 'periodontal' | 'crown' | 'implant' | 'filling';
  intervalMonths: number;
  status: 'due' | 'overdue' | 'contacted' | 'scheduled' | 'completed';
  contactAttempts: number;
  lastContactDate?: string;
  preferredContactMethod: 'sms' | 'email' | 'call';
  estimatedRevenue: number;
  notes?: string;
}

class AirtableService {
  private apiToken: string;
  private baseId: string;
  private baseUrl: string;

  // Table names - these should match your Airtable base structure
  private readonly tables = {
    patients: 'Patients',
    appointments: 'Appointments',
    treatmentPlans: 'Treatment Plans',
    waitlist: 'Waitlist',
    recalls: 'Recalls',
    emergencyLog: 'Emergency Log',
    complianceLog: 'HIPAA Compliance Log'
  };

  constructor() {
    this.apiToken = import.meta.env.VITE_AIRTABLE_API_TOKEN;
    this.baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;

    if (!this.apiToken || !this.baseId) {
      console.warn('Airtable configuration missing. Please check environment variables.');
      console.warn('Expected: VITE_AIRTABLE_API_TOKEN and VITE_AIRTABLE_BASE_ID');
      // Don't throw error to allow graceful degradation
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', 
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const config: RequestInit = {
        method,
        headers: this.getHeaders()
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Airtable request failed:', error);
      throw error;
    }
  }

  // Patient Management
  async createPatient(patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientRecord> {
    const record = {
      fields: {
        ...patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.patients}`, 'POST', record);
    return { id: response.id, ...response.fields };
  }

  async getPatient(patientId: string): Promise<PatientRecord | null> {
    try {
      const response = await this.makeRequest<any>(`${this.tables.patients}/${patientId}`);
      return { id: response.id, ...response.fields };
    } catch (error) {
      console.error('Patient not found:', error);
      return null;
    }
  }

  async findPatientByPhone(phone: string): Promise<PatientRecord | null> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await this.makeRequest<any>(
        `${this.tables.patients}?filterByFormula=SUBSTITUTE(phone, "-", "") = "${cleanPhone}"`
      );
      
      if (response.records && response.records.length > 0) {
        const record = response.records[0];
        return { id: record.id, ...record.fields };
      }
      return null;
    } catch (error) {
      console.error('Error finding patient by phone:', error);
      return null;
    }
  }

  async updatePatient(patientId: string, updates: Partial<PatientRecord>): Promise<PatientRecord> {
    const record = {
      fields: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.patients}/${patientId}`, 'PATCH', record);
    return { id: response.id, ...response.fields };
  }

  // Appointment Management
  async createAppointment(appointment: Omit<AppointmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentRecord> {
    const record = {
      fields: {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.appointments}`, 'POST', record);
    return { id: response.id, ...response.fields };
  }

  async getAppointments(filters?: {
    date?: string;
    patientId?: string;
    status?: string;
    provider?: string;
  }): Promise<AppointmentRecord[]> {
    let filterFormula = '';
    
    if (filters) {
      const conditions: string[] = [];
      
      if (filters.date) {
        conditions.push(`appointmentDate = "${filters.date}"`);
      }
      if (filters.patientId) {
        conditions.push(`patientId = "${filters.patientId}"`);
      }
      if (filters.status) {
        conditions.push(`status = "${filters.status}"`);
      }
      if (filters.provider) {
        conditions.push(`provider = "${filters.provider}"`);
      }
      
      if (conditions.length > 0) {
        filterFormula = `?filterByFormula=AND(${conditions.join(', ')})`;
      }
    }

    const response = await this.makeRequest<any>(`${this.tables.appointments}${filterFormula}`);
    return response.records.map((record: any) => ({ id: record.id, ...record.fields }));
  }

  async updateAppointment(appointmentId: string, updates: Partial<AppointmentRecord>): Promise<AppointmentRecord> {
    const record = {
      fields: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.appointments}/${appointmentId}`, 'PATCH', record);
    return { id: response.id, ...response.fields };
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<AppointmentRecord> {
    return this.updateAppointment(appointmentId, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
  }

  // Emergency Booking
  async createEmergencyAppointment(emergencyData: {
    patientName: string;
    phone: string;
    symptoms: string;
    painLevel: number;
    urgencyLevel: 'high' | 'medium' | 'low';
  }): Promise<{ patient: PatientRecord; appointment: AppointmentRecord }> {
    try {
      // Find or create patient
      let patient = await this.findPatientByPhone(emergencyData.phone);
      
      if (!patient) {
        patient = await this.createPatient({
          patientName: emergencyData.patientName,
          phone: emergencyData.phone,
          preferredContactMethod: 'sms',
          status: 'active'
        });
      }

      // Calculate appointment time based on urgency
      const appointmentDate = new Date();
      const hoursToAdd = emergencyData.urgencyLevel === 'high' ? 2 : 
                        emergencyData.urgencyLevel === 'medium' ? 6 : 24;
      appointmentDate.setHours(appointmentDate.getHours() + hoursToAdd);

      // Create emergency appointment
      const appointment = await this.createAppointment({
        patientId: patient.id!,
        patientName: emergencyData.patientName,
        phone: emergencyData.phone,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime: appointmentDate.toTimeString().slice(0, 5),
        duration: 60,
        procedure: 'Emergency Consultation',
        provider: 'Dr. Available',
        status: 'scheduled',
        priority: 'emergency',
        symptoms: emergencyData.symptoms,
        painLevel: emergencyData.painLevel,
        estimatedCost: 200,
        createdBy: 'ai-assistant'
      });

      // Log emergency booking
      await this.logEmergencyBooking({
        patientName: emergencyData.patientName,
        phone: emergencyData.phone,
        symptoms: emergencyData.symptoms,
        painLevel: emergencyData.painLevel,
        urgencyLevel: emergencyData.urgencyLevel,
        appointmentId: appointment.id!,
        bookedAt: new Date().toISOString()
      });

      return { patient, appointment };
    } catch (error) {
      console.error('Emergency appointment creation failed:', error);
      throw error;
    }
  }

  // Waitlist Management
  async addToWaitlist(waitlistData: Omit<WaitlistRecord, 'id' | 'addedDate' | 'contactAttempts' | 'status'>): Promise<WaitlistRecord> {
    const record = {
      fields: {
        ...waitlistData,
        addedDate: new Date().toISOString(),
        contactAttempts: 0,
        status: 'active'
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.waitlist}`, 'POST', record);
    return { id: response.id, ...response.fields };
  }

  async getWaitlist(filters?: { priority?: string; procedure?: string }): Promise<WaitlistRecord[]> {
    let filterFormula = '';
    
    if (filters) {
      const conditions: string[] = ['status = "active"'];
      
      if (filters.priority) {
        conditions.push(`priority = "${filters.priority}"`);
      }
      if (filters.procedure) {
        conditions.push(`procedure = "${filters.procedure}"`);
      }
      
      filterFormula = `?filterByFormula=AND(${conditions.join(', ')})&sort[0][field]=addedDate&sort[0][direction]=asc`;
    }

    const response = await this.makeRequest<any>(`${this.tables.waitlist}${filterFormula}`);
    return response.records.map((record: any) => ({ id: record.id, ...record.fields }));
  }

  // Recall Management
  async createRecall(recallData: Omit<RecallRecord, 'id' | 'contactAttempts' | 'status'>): Promise<RecallRecord> {
    const record = {
      fields: {
        ...recallData,
        contactAttempts: 0,
        status: 'due'
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.recalls}`, 'POST', record);
    return { id: response.id, ...response.fields };
  }

  async getDueRecalls(): Promise<RecallRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.makeRequest<any>(
      `${this.tables.recalls}?filterByFormula=AND(nextDueDate <= "${today}", OR(status = "due", status = "overdue"))&sort[0][field]=nextDueDate&sort[0][direction]=asc`
    );
    
    return response.records.map((record: any) => ({ id: record.id, ...record.fields }));
  }

  // Treatment Plans
  async createTreatmentPlan(treatmentPlan: Omit<TreatmentPlan, 'id' | 'createdDate'>): Promise<TreatmentPlan> {
    const record = {
      fields: {
        ...treatmentPlan,
        createdDate: new Date().toISOString()
      }
    };

    const response = await this.makeRequest<any>(`${this.tables.treatmentPlans}`, 'POST', record);
    return { id: response.id, ...response.fields };
  }

  // Logging and Compliance
  async logEmergencyBooking(emergencyLog: {
    patientName: string;
    phone: string;
    symptoms: string;
    painLevel: number;
    urgencyLevel: string;
    appointmentId: string;
    bookedAt: string;
  }): Promise<void> {
    const record = {
      fields: {
        ...emergencyLog,
        logType: 'emergency_booking',
        timestamp: new Date().toISOString()
      }
    };

    await this.makeRequest(`${this.tables.emergencyLog}`, 'POST', record);
  }

  async logHIPAACompliance(complianceLog: {
    action: string;
    dataType: string;
    redacted: boolean;
    userAgent: string;
    ipAddress?: string;
  }): Promise<void> {
    const record = {
      fields: {
        ...complianceLog,
        timestamp: new Date().toISOString(),
        sessionId: `session-${Date.now()}`
      }
    };

    await this.makeRequest(`${this.tables.complianceLog}`, 'POST', record);
  }

  // Analytics and Reporting
  async getAppointmentStats(dateRange?: { start: string; end: string }): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShows: number;
    emergencyBookings: number;
    averageDuration: number;
    totalRevenue: number;
  }> {
    try {
      let filterFormula = '';
      if (dateRange) {
        filterFormula = `?filterByFormula=AND(appointmentDate >= "${dateRange.start}", appointmentDate <= "${dateRange.end}")`;
      }

      const response = await this.makeRequest<any>(`${this.tables.appointments}${filterFormula}`);
      const appointments = response.records.map((record: any) => record.fields);

      const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter((apt: any) => apt.status === 'completed').length,
        cancelledAppointments: appointments.filter((apt: any) => apt.status === 'cancelled').length,
        noShows: appointments.filter((apt: any) => apt.status === 'no-show').length,
        emergencyBookings: appointments.filter((apt: any) => apt.priority === 'emergency').length,
        averageDuration: appointments.reduce((sum: number, apt: any) => sum + (apt.duration || 0), 0) / appointments.length || 0,
        totalRevenue: appointments
          .filter((apt: any) => apt.status === 'completed')
          .reduce((sum: number, apt: any) => sum + (apt.estimatedCost || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'healthy' | 'error'; message: string }> {
    try {
      await this.makeRequest(`${this.tables.patients}?maxRecords=1`);
      return { status: 'healthy', message: 'Airtable connection successful' };
    } catch (error) {
      return { status: 'error', message: `Airtable connection failed: ${error}` };
    }
  }
}

// Export singleton instance
export const airtableService = new AirtableService();
export default airtableService;