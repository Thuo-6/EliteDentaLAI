import { useState, useEffect, useCallback } from 'react';
import { airtableService, PatientRecord, AppointmentRecord, WaitlistRecord, RecallRecord } from '../services/airtableService';

export const useAirtable = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Health check on mount
  useEffect(() => {
    const checkConnection = async () => {
      // Skip if no credentials
      if (!import.meta.env.VITE_AIRTABLE_API_TOKEN || !import.meta.env.VITE_AIRTABLE_BASE_ID) {
        setError('Airtable credentials not configured');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const health = await airtableService.healthCheck();
        setIsConnected(health.status === 'healthy');
        if (health.status === 'error') {
          setError(health.message);
        }
      } catch (err) {
        setError('Failed to connect to Airtable');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Patient operations
  const createPatient = useCallback(async (patientData: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const patient = await airtableService.createPatient(patientData);
      return patient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findPatientByPhone = useCallback(async (phone: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const patient = await airtableService.findPatientByPhone(phone);
      return patient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find patient';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Appointment operations
  const createAppointment = useCallback(async (appointmentData: Omit<AppointmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const appointment = await airtableService.createAppointment(appointmentData);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAppointments = useCallback(async (filters?: {
    date?: string;
    patientId?: string;
    status?: string;
    provider?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const appointments = await airtableService.getAppointments(filters);
      return appointments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get appointments';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Emergency booking
  const createEmergencyAppointment = useCallback(async (emergencyData: {
    patientName: string;
    phone: string;
    symptoms: string;
    painLevel: number;
    urgencyLevel: 'high' | 'medium' | 'low';
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await airtableService.createEmergencyAppointment(emergencyData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create emergency appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Waitlist operations
  const addToWaitlist = useCallback(async (waitlistData: Omit<WaitlistRecord, 'id' | 'addedDate' | 'contactAttempts' | 'status'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const waitlistEntry = await airtableService.addToWaitlist(waitlistData);
      return waitlistEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to waitlist';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWaitlist = useCallback(async (filters?: { priority?: string; procedure?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const waitlist = await airtableService.getWaitlist(filters);
      return waitlist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get waitlist';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recall operations
  const getDueRecalls = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const recalls = await airtableService.getDueRecalls();
      return recalls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get due recalls';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analytics
  const getAppointmentStats = useCallback(async (dateRange?: { start: string; end: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await airtableService.getAppointmentStats(dateRange);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get appointment stats';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Connection status
    isConnected,
    isLoading,
    error,
    
    // Patient operations
    createPatient,
    findPatientByPhone,
    
    // Appointment operations
    createAppointment,
    getAppointments,
    createEmergencyAppointment,
    
    // Waitlist operations
    addToWaitlist,
    getWaitlist,
    
    // Recall operations
    getDueRecalls,
    
    // Analytics
    getAppointmentStats,
    
    // Utility
    clearError: () => setError(null)
  };
};