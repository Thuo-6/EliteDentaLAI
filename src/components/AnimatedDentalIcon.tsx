import React from 'react';

export const AnimatedDentalIcon = ({ className = "w-8 h-8", isActive = false }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Cartoon Tooth Character */}
      <div className={`
        relative w-full h-full
        transform-gpu transition-all duration-500 ease-out
        ${isActive ? 'scale-110 animate-bounce-gentle' : 'scale-100'}
      `}>
        <svg 
          viewBox="0 0 120 120" 
          className={`
            w-full h-full drop-shadow-lg
            transform transition-all duration-700 ease-in-out
            ${isActive ? 'animate-wiggle' : ''}
          `}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="toothBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#fefefe" />
              <stop offset="80%" stopColor="#f0f8ff" />
              <stop offset="100%" stopColor="#e6f3ff" />
            </linearGradient>
            
            <linearGradient id="toothShine" x1="0%" y1="0%" x2="70%" y2="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            
            <radialGradient id="cheekBlush" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(255, 182, 193, 0.6)" />
              <stop offset="100%" stopColor="rgba(255, 182, 193, 0)" />
            </radialGradient>

            <radialGradient id="glowEffect" cx="50%" cy="40%">
              <stop offset="0%" stopColor="rgba(137, 207, 240, 0.4)" />
              <stop offset="100%" stopColor="rgba(137, 207, 240, 0)" />
            </radialGradient>
          </defs>
          
          {/* Glow Effect Background */}
          <circle 
            cx="60" 
            cy="55" 
            r="45" 
            fill="url(#glowEffect)" 
            className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Main Tooth Body */}
          <path
            d="M60 20 
               C75 20, 85 30, 85 45
               C85 55, 83 65, 80 75
               C77 85, 73 90, 60 90
               C47 90, 43 85, 40 75
               C37 65, 35 55, 35 45
               C35 30, 45 20, 60 20 Z"
            fill="url(#toothBody)"
            stroke="#e0e0e0"
            strokeWidth="1"
            className={`
              transition-all duration-500 ease-out
              ${isActive ? 'animate-tooth-pulse' : ''}
            `}
          />
          
          {/* Tooth Shine/Highlight */}
          <ellipse
            cx="52"
            cy="40"
            rx="12"
            ry="20"
            fill="url(#toothShine)"
            className="animate-shimmer"
          />
          
          {/* Cartoon Eyes */}
          <g className={`${isActive ? 'animate-blink' : ''}`}>
            {/* Left Eye */}
            <ellipse cx="50" cy="45" rx="6" ry="8" fill="#2c3e50" />
            <ellipse cx="52" cy="43" rx="2" ry="3" fill="#ffffff" />
            
            {/* Right Eye */}
            <ellipse cx="70" cy="45" rx="6" ry="8" fill="#2c3e50" />
            <ellipse cx="72" cy="43" rx="2" ry="3" fill="#ffffff" />
          </g>
          
          {/* Cute Smile */}
          <path
            d="M45 60 Q60 70 75 60"
            stroke="#e74c3c"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className={`${isActive ? 'animate-smile-grow' : ''}`}
          />
          
          {/* Rosy Cheeks */}
          <ellipse 
            cx="35" 
            cy="55" 
            rx="8" 
            ry="6" 
            fill="url(#cheekBlush)"
            className={`${isActive ? 'animate-blush' : 'opacity-60'}`}
          />
          <ellipse 
            cx="85" 
            cy="55" 
            rx="8" 
            ry="6" 
            fill="url(#cheekBlush)"
            className={`${isActive ? 'animate-blush' : 'opacity-60'}`}
          />
          
          {/* Tooth Roots (simplified for cartoon style) */}
          <path
            d="M50 85 C50 93, 47 97, 45 100 C43 103, 45 105, 47 103 C49 101, 53 95, 53 90"
            fill="url(#toothBody)"
            opacity="0.7"
          />
          <path
            d="M70 85 C70 93, 73 97, 75 100 C77 103, 75 105, 73 103 C71 101, 67 95, 67 90"
            fill="url(#toothBody)"
            opacity="0.7"
          />
          
          {/* Sparkle Effects */}
          <g className={`${isActive ? 'animate-sparkle' : 'opacity-0'} transition-opacity duration-300`}>
            <g className="animate-twinkle-1">
              <path d="M25 35 L27 37 L25 39 L23 37 Z" fill="#ffd700" />
              <path d="M25 33 L25 41 M21 37 L29 37" stroke="#ffd700" strokeWidth="1"/>
            </g>
            <g className="animate-twinkle-2">
              <path d="M95 40 L97 42 L95 44 L93 42 Z" fill="#ffd700" />
              <path d="M95 38 L95 46 M91 42 L99 42" stroke="#ffd700" strokeWidth="1"/>
            </g>
            <g className="animate-twinkle-3">
              <path d="M60 15 L62 17 L60 19 L58 17 Z" fill="#87ceeb" />
              <path d="M60 13 L60 21 M56 17 L64 17" stroke="#87ceeb" strokeWidth="1"/>
            </g>
          </g>
          
          {/* Happy Eyebrows (when active) */}
          {isActive && (
            <g className="animate-eyebrow-dance">
              <path d="M44 35 Q50 32 56 35" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M64 35 Q70 32 76 35" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
          )}
        </svg>
      </div>
      
      {/* Floating Hearts Effect */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-heart"
              style={{
                left: `${20 + (i * 20)}%`,
                bottom: '10%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i * 0.3)}s`
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff69b4" opacity="0.7">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0px) scale(1.1); }
    50% { transform: translateY(-5px) scale(1.15); }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  }
  
  @keyframes tooth-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  
  @keyframes shimmer {
    0% { opacity: 0.4; transform: translateX(-3px); }
    50% { opacity: 0.9; transform: translateX(0px); }
    100% { opacity: 0.4; transform: translateX(3px); }
  }
  
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  
  @keyframes smile-grow {
    0%, 100% { stroke-width: 3; }
    50% { stroke-width: 4; }
  }
  
  @keyframes blush {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.1); }
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  
  @keyframes twinkle-1 {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes twinkle-2 {
    0%, 100% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes twinkle-3 {
    0%, 100% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(0.9); }
  }
  
  @keyframes eyebrow-dance {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
  }
  
  @keyframes float-heart {
    0% { transform: translateY(0px) scale(0); opacity: 0; }
    10% { opacity: 1; transform: scale(1); }
    90% { opacity: 1; }
    100% { transform: translateY(-30px) scale(0); opacity: 0; }
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }
  
  .animate-wiggle {
    animation: wiggle 1s ease-in-out infinite;
  }
  
  .animate-tooth-pulse {
    animation: tooth-pulse 1.5s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 3s ease-in-out infinite;
  }
  
  .animate-blink {
    animation: blink 4s ease-in-out infinite;
  }
  
  .animate-smile-grow {
    animation: smile-grow 2s ease-in-out infinite;
  }
  
  .animate-blush {
    animation: blush 2s ease-in-out infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 2s ease-in-out infinite;
  }
  
  .animate-twinkle-1 {
    animation: twinkle-1 2s ease-in-out infinite;
  }
  
  .animate-twinkle-2 {
    animation: twinkle-2 2.5s ease-in-out infinite 0.5s;
  }
  
  .animate-twinkle-3 {
    animation: twinkle-3 1.8s ease-in-out infinite 1s;
  }
  
  .animate-eyebrow-dance {
    animation: eyebrow-dance 1s ease-in-out infinite;
  }
  
  .animate-float-heart {
    animation: float-heart 3s ease-out infinite;
  }
`;

if (!document.head.querySelector('style[data-cartoon-tooth-animations]')) {
  style.setAttribute('data-cartoon-tooth-animations', 'true');
  document.head.appendChild(style);
}