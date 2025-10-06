import React from 'react';
import { VoiceWidget } from './components/VoiceWidget';
import { AnimatedDentalIcon } from './components/AnimatedDentalIcon';
import { ClinicDashboard } from './components/ClinicDashboard';
import { StarfieldBackground } from './components/StarfieldBackground';
import { FloatingElements } from './components/FloatingElements';
import { ParticleField } from './components/ParticleField';

function App() {
  const [currentView, setCurrentView] = React.useState<'landing' | 'dashboard'>('landing');
  const [isInteracting, setIsInteracting] = React.useState(false);

  if (currentView === 'dashboard') {
    return <ClinicDashboard />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* Enhanced 3D Background Layers */}
      <StarfieldBackground 
        className="opacity-80" 
        starCount={1500} 
        speed={1.2} 
        interactive={true}
        warpSpeed={isInteracting}
      />
      
      <FloatingElements 
        className="opacity-60" 
        elementCount={30} 
        interactive={true}
        depth={1200}
      />
      
      <ParticleField 
        className="opacity-40" 
        particleCount={200} 
        interactive={true}
        intensity={isInteracting ? 2 : 1}
      />

      {/* Main Content with Enhanced 3D Effects */}
      <div 
        className="relative z-10 container mx-auto px-4 py-16"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        <div className="text-center mb-16">
          {/* Enhanced 3D Logo Container */}
          <div className="relative w-40 h-40 mx-auto mb-8 perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-gray-900/20 rounded-3xl shadow-2xl backdrop-blur-sm border border-[#89CFF0]/30 transform-gpu transition-all duration-700 hover:scale-110 hover:rotate-y-12 preserve-3d">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#89CFF0]/20 to-[#F0FFFF]/10 rounded-3xl blur-xl"></div>
              
              {/* Icon container */}
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatedDentalIcon className="w-24 h-24" isActive={true} />
              </div>
              
              {/* Floating particles around logo */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-[#89CFF0] rounded-full opacity-60 animate-float-orbit"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${i * 45}deg) translateX(60px) translateY(-50%)`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '4s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Typography with 3D Effects */}
          <div className="relative">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-[#89CFF0] to-[#F0FFFF] bg-clip-text text-transparent transform-gpu transition-all duration-500 hover:scale-105">
              Elite Dental
            </h1>
            <div className="absolute inset-0 text-6xl md:text-7xl font-bold text-[#89CFF0]/20 blur-sm -z-10 transform translate-x-1 translate-y-1">
              Elite Dental
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 rounded-2xl p-6 border border-[#89CFF0]/20">
            Experience HIPAA-compliant dental appointments with our AI-powered scheduling assistant. 
            Emergency triage, insurance verification, and instant booking available 24/7.
          </p>
        </div>

        {/* Enhanced Feature Grid with 3D Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {[
            {
              title: "AI-Powered Scheduling",
              description: "Premium female AI assistant with HIPAA-compliant scheduling, emergency triage, and insurance verification with natural conversation flow.",
              icon: <AnimatedDentalIcon className="w-12 h-12" isActive={false} />,
              gradient: "from-[#89CFF0] to-[#F0FFFF]"
            },
            {
              title: "Premium Voice Experience",
              description: "Crystal-clear voice recognition with natural conversation flow, emergency triage, and intelligent appointment scheduling.",
              icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ),
              gradient: "from-[#87CEEB] to-[#B0E0E6]"
            },
            {
              title: "Smart Transcription",
              description: "Real-time HIPAA-compliant transcription with automatic PHI redaction, conversation history, and accessibility features.",
              icon: (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              gradient: "from-[#F0FFFF] to-[#E0F6FF]"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Card Background with Enhanced 3D Effect */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#89CFF0]/30 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#89CFF0]/5 to-[#F0FFFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating icon container */}
                <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform-gpu transition-all duration-500 group-hover:rotate-y-12 group-hover:scale-110`}>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-[#89CFF0] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#89CFF0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Status and CTA Section */}
        <div className="text-center">
          {/* Status Indicator with 3D Effect */}
          <div className="inline-flex items-center gap-3 bg-black/30 backdrop-blur-md px-8 py-4 rounded-full border border-[#89CFF0]/30 mb-8 transform-gpu transition-all duration-300 hover:scale-105">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-lg font-medium text-white">🦷 Elite Dental AI Ready - HIPAA Compliant</span>
          </div>
          
          {/* Donation Section */}
          <div className="mb-8 p-6 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl border border-[#89CFF0]/20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Support Continued Development ☕</h3>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                If this widget helps your business, consider buying me a coffee to support ongoing improvements.
              </p>
              
              <div className="grid gap-4 text-left">
                <h4 className="text-lg font-semibold text-[#89CFF0] text-center mb-4">Payment Options:</h4>
                
                {/* Binance */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#89CFF0]/20 hover:border-[#89CFF0]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🟡</span>
                    <div>
                      <div className="text-white font-medium">Binance Users</div>
                      <div className="text-gray-400 text-sm">Pay via Binance ID</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[#89CFF0] font-mono text-sm bg-black/30 px-3 py-1 rounded">86664780</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('86664780')}
                      className="px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* M-Pesa */}
                {/* USDT */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#89CFF0]/20 hover:border-[#89CFF0]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💚</span>
                    <div>
                      <div className="text-white font-medium">USDT</div>
                      <div className="text-gray-400 text-sm">Tron (TRC20)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[#89CFF0] font-mono text-xs bg-black/30 px-2 py-1 rounded max-w-[200px] truncate">TVi5L1eoLywjEqMYhw21nGAmREY8Cac9qJ</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('TVi5L1eoLywjEqMYhw21nGAmREY8Cac9qJ')}
                      className="px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* Ethereum */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#89CFF0]/20 hover:border-[#89CFF0]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔷</span>
                    <div>
                      <div className="text-white font-medium">Ethereum</div>
                      <div className="text-gray-400 text-sm">ERC20</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[#89CFF0] font-mono text-xs bg-black/30 px-2 py-1 rounded max-w-[200px] truncate">0xcffeefd6fa4e67f96a390498e59913ab0edb51df</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('0xcffeefd6fa4e67f96a390498e59913ab0edb51df')}
                      className="px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* Bitcoin/BNB */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#89CFF0]/20 hover:border-[#89CFF0]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🟠</span>
                    <div>
                      <div className="text-white font-medium">Bitcoin/BNB</div>
                      <div className="text-gray-400 text-sm">BNB Smartchain (BEP20)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[#89CFF0] font-mono text-xs bg-black/30 px-2 py-1 rounded max-w-[200px] truncate">0xcffeefd6fa4e67f96a390498e59913ab0edb51df</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('0xcffeefd6fa4e67f96a390498e59913ab0edb51df')}
                      className="px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* Solana */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#89CFF0]/20 hover:border-[#89CFF0]/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🟣</span>
                    <div>
                      <div className="text-white font-medium">Solana</div>
                      <div className="text-gray-400 text-sm">Case-sensitive</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[#89CFF0] font-mono text-xs bg-black/30 px-2 py-1 rounded max-w-[200px] truncate">9pGwHNjck5GamJ4H5LfZAesLGRUCfnZF1crUbipHuG4i</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('9pGwHNjck5GamJ4H5LfZAesLGRUCfnZF1crUbipHuG4i')}
                      className="px-3 py-1 bg-[#89CFF0] text-white rounded-lg hover:bg-[#89CFF0]/90 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-200 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span><strong>Note:</strong> Solana address is case-sensitive. Copy and paste exactly as shown.</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Your support helps maintain and improve this free tool for dental practices worldwide.
                </p>
              </div>
            </div>
          </div>
          
          {/* Enhanced CTA Button with 3D Effects */}
          <div className="relative inline-block">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="relative group bg-gradient-to-r from-[#89CFF0] to-[#F0FFFF] text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-2xl transform-gpu transition-all duration-300 hover:scale-110 hover:shadow-[#89CFF0]/50 active:scale-95 overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#89CFF0] to-[#F0FFFF] blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <span className="relative z-10 flex items-center gap-3">
                View Clinic Dashboard
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Voice Widget */}
      <VoiceWidget />
      
      {/* Custom CSS for enhanced 3D animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        
        @keyframes float-orbit {
          0% { transform: rotate(0deg) translateX(60px) translateY(-50%); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(60px) translateY(-50%); opacity: 0.3; }
        }
        
        .animate-float-orbit {
          animation: float-orbit 4s ease-in-out infinite;
        }
        
        @keyframes shimmer-3d {
          0% { transform: translateX(-100%) rotateY(0deg); }
          100% { transform: translateX(100%) rotateY(180deg); }
        }
        
        .animate-shimmer-3d {
          animation: shimmer-3d 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;