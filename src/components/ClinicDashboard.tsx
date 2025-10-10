import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Shield, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { NoShowDefender } from '../services/noShowDefender';
import { EmergencyTriage } from '../services/emergencyTriage';
import { HIPAAShield } from '../services/hipaaShield';
import { RecallAutomator } from '../services/recallAutomator';
import { useAirtable } from '../hooks/useAirtable';

interface MetricProps {
  title: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
  color: string;
}

const Metric: React.FC<MetricProps> = ({ title, value, delta, icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
        delta.startsWith('+') ? 'bg-green-100 text-green-700' : 
        delta.startsWith('-') ? 'bg-red-100 text-red-700' : 
        'bg-blue-100 text-blue-700'
      }`}>
        {delta}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

export const ClinicDashboard: React.FC = () => {
  const { 
    isConnected, 
    isLoading, 
    error: airtableError, 
    getAppointmentStats,
    getAppointments,
    getWaitlist,
    getDueRecalls
  } = useAirtable();

  const [dashboardData, setDashboardData] = useState({
    revenueRecovery: 8400,
    noShowRate: 7,
    emergencyCapture: 92,
    waitlistStats: { total: 0, byPriority: {}, averageWaitTime: 0 },
    recallStats: { totalDue: 0, potentialRevenue: 0, contactSuccessRate: 0 },
    hipaaCompliance: { complianceScore: 0, last24Hours: 0 },
    airtableStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      totalRevenue: 0,
      emergencyBookings: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'cancellation' | 'emergency' | 'recall' | 'compliance';
    message: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
  }>>([]);

  useEffect(() => {
    // Real-time data updates with Airtable integration
    const updateDashboard = async () => {
      const waitlistStats = NoShowDefender.getWaitlistStats();
      const recallStats = RecallAutomator.getRecallStats();
      const hipaaStats = HIPAAShield.getAuditSummary();

      let airtableStats = {
        totalAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        emergencyBookings: 0
      };

      // Get real data from Airtable if connected
      if (isConnected) {
        try {
          const stats = await getAppointmentStats();
          if (stats) {
            airtableStats = {
              totalAppointments: stats.totalAppointments,
              completedAppointments: stats.completedAppointments,
              totalRevenue: stats.totalRevenue,
              emergencyBookings: stats.emergencyBookings
            };
          }
        } catch (error) {
          console.error('Failed to get Airtable stats:', error);
        }
      }

      setDashboardData(prev => ({
        ...prev,
        revenueRecovery: 8400 + Math.floor(Math.random() * 1000),
        noShowRate: 7 + Math.floor(Math.random() * 3),
        emergencyCapture: 92 + Math.floor(Math.random() * 5),
        waitlistStats,
        recallStats,
        hipaaCompliance: {
          complianceScore: hipaaStats.complianceRate,
          last24Hours: hipaaStats.last24Hours
        },
        airtableStats
      }));
    };

    // Simulate recent activity
    const activities = [
      {
        id: '1',
        type: 'cancellation' as const,
        message: 'Last-minute cancellation filled from waitlist - $420 recovered',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success' as const
      },
      {
        id: '2', 
        type: 'emergency' as const,
        message: 'Emergency triage: "severe tooth pain" - booked within 2 hours',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'warning' as const
      },
      {
        id: '3',
        type: 'recall' as const,
        message: 'Recall campaign sent to 12 patients - 8 responses received',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success' as const
      },
      {
        id: '4',
        type: 'compliance' as const,
        message: 'HIPAA scan completed - 3 PHI elements redacted',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'success' as const
      }
    ];

    setRecentActivity(activities);
    updateDashboard();

    const interval = setInterval(updateDashboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, getAppointmentStats]);

  const handleSimulateCancellation = () => {
    NoShowDefender.simulateCancellation();
    
    // Add to recent activity
    const newActivity = {
      id: Date.now().toString(),
      type: 'cancellation' as const,
      message: `Simulated cancellation - checking waitlist for replacement`,
      timestamp: new Date(),
      status: 'success' as const
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const handleRecallCampaign = async () => {
    const results = await RecallAutomator.processRecallCampaign();
    
    const newActivity = {
      id: Date.now().toString(),
      type: 'recall' as const,
      message: `Recall campaign: ${results.contacted} contacted, ${results.scheduled} scheduled - $${results.potentialRevenue.toLocaleString()} potential revenue`,
      timestamp: new Date(),
      status: 'success' as const
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FFFF] via-[#FAF9F6] to-[#89CFF0]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Elite Dental Clinic Dashboard</h1>
              <p className="text-gray-600">Real-time practice management and revenue optimization</p>
            </div>
            
            {/* Airtable Connection Status */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <Database className="w-4 h-4" />
                    <span>Airtable Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <Database className="w-4 h-4" />
                    <span>Airtable Disconnected</span>
                  </>
                )}
              </div>
              
              {isLoading && (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
          
          {airtableError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Airtable Connection Error:</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{airtableError}</p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Metric
            title="Total Revenue (Airtable)"
            value={`$${dashboardData.airtableStats.totalRevenue.toLocaleString()}`}
            delta={isConnected ? "+Live Data" : "Offline"}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          
          <Metric
            title="Total Appointments"
            value={dashboardData.airtableStats.totalAppointments.toString()}
            delta={isConnected ? "Live Data" : "Offline"}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          
          <Metric
            title="Emergency Bookings"
            value={dashboardData.airtableStats.emergencyBookings.toString()}
            delta={isConnected ? "Live Data" : "Offline"}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          
          <Metric
            title="HIPAA Compliance"
            value={`${dashboardData.hipaaCompliance.complianceScore}%`}
            delta="100%"
            icon={<Shield className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Airtable Integration Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Database Integration</h3>
              <Database className="w-5 h-5 text-[#89CFF0]" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Connection Status</span>
                <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="font-semibold text-gray-800">Airtable</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Records</span>
                <span className="font-semibold text-gray-800">
                  {dashboardData.airtableStats.totalAppointments + dashboardData.waitlistStats.total}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className={`text-sm p-3 rounded-lg ${
                  isConnected 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {isConnected 
                    ? '✅ All patient data is being synced to Airtable in real-time'
                    : '⚠️ Database connection lost. Operating in offline mode.'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist Management */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Waitlist Management</h3>
              <Users className="w-5 h-5 text-[#89CFF0]" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Patients</span>
                <span className="font-semibold text-gray-800">{dashboardData.waitlistStats.total}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Emergency</span>
                  <span className="font-medium">{dashboardData.waitlistStats.byPriority.emergency || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">New Patient</span>
                  <span className="font-medium">{dashboardData.waitlistStats.byPriority.new_patient || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Regular</span>
                  <span className="font-medium">{dashboardData.waitlistStats.byPriority.regular || 0}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={handleSimulateCancellation}
                  className="w-full bg-[#89CFF0] text-white py-2 px-4 rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm font-medium"
                >
                  Simulate Cancellation
                </button>
              </div>
            </div>
          </div>

          {/* Recall System */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recall System</h3>
              <Clock className="w-5 h-5 text-[#89CFF0]" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Recalls</span>
                <span className="font-semibold text-gray-800">{dashboardData.recallStats.totalDue}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Potential Revenue</span>
                <span className="font-semibold text-green-600">${dashboardData.recallStats.potentialRevenue.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-800">{dashboardData.recallStats.contactSuccessRate}%</span>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={handleRecallCampaign}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Run Recall Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp.toLocaleTimeString()} - {activity.type}
                  </p>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'success' ? 'bg-green-100 text-green-700' :
                  activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};