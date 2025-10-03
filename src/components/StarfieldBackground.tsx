import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
  twinkle: number;
}

interface StarfieldBackgroundProps {
  className?: string;
  starCount?: number;
  speed?: number;
  interactive?: boolean;
  warpSpeed?: boolean;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  className = '',
  starCount = 1200,
  speed = 0.8,
  interactive = true,
  warpSpeed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [isWarpActive, setIsWarpActive] = useState(warpSpeed);

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas dimensions with proper DPI handling
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      dimensionsRef.current = {
        width: rect.width,
        height: rect.height
      };
    };

    updateDimensions();

    // Initialize stars with enhanced properties
    const initStars = () => {
      const colors = [
        '#ffffff',
        '#89CFF0', // Primary blue
        '#F0FFFF', // Light cyan
        '#87CEEB', // Sky blue
        '#B0E0E6', // Powder blue
        '#E0F6FF'  // Alice blue
      ];

      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * dimensionsRef.current.width,
        y: Math.random() * dimensionsRef.current.height,
        z: Math.random() * 2000 + 100,
        prevX: 0,
        prevY: 0,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.9 + 0.1,
        speed: Math.random() * speed + speed * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2
      }));
    };

    initStars();

    // Enhanced mouse interaction with smooth following
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      
      const rect = canvas.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      
      // Smooth mouse following
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.1;
    };

    // Warp speed toggle on click
    const handleClick = () => {
      if (interactive) {
        setIsWarpActive(prev => !prev);
      }
    };

    // Enhanced animation loop with Starlink-inspired effects
    const animate = () => {
      const { width, height } = dimensionsRef.current;
      
      // Dynamic background with depth
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGradient.addColorStop(0, 'rgba(0, 5, 15, 0.95)');
      bgGradient.addColorStop(0.3, 'rgba(0, 10, 25, 0.9)');
      bgGradient.addColorStop(0.7, 'rgba(0, 15, 35, 0.85)');
      bgGradient.addColorStop(1, 'rgba(0, 20, 45, 0.8)');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw stars with enhanced effects
      starsRef.current.forEach((star, index) => {
        // Store previous position for enhanced trail effect
        star.prevX = star.x;
        star.prevY = star.y;

        // Dynamic speed based on warp mode
        const currentSpeed = isWarpActive ? star.speed * 8 : star.speed;
        
        // Move star towards camera with perspective
        star.z -= currentSpeed * (isWarpActive ? 15 : 3);

        // Update twinkle animation
        star.twinkle += 0.1;

        // Reset star if it's too close with better distribution
        if (star.z <= 0) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = 2000 + Math.random() * 500;
          star.speed = Math.random() * speed + speed * 0.3;
        }

        // Enhanced 3D projection with perspective correction
        const perspective = 800;
        const x = (star.x - width / 2) * (perspective / star.z) + width / 2;
        const y = (star.y - height / 2) * (perspective / star.z) + height / 2;

        // Mouse interaction with gravitational effect
        if (interactive) {
          const mouseDistance = Math.sqrt(
            Math.pow(x - mouseRef.current.x, 2) + 
            Math.pow(y - mouseRef.current.y, 2)
          );
          
          if (mouseDistance < 150) {
            const force = (150 - mouseDistance) / 150;
            star.z -= force * 20;
            star.opacity = Math.min(1, star.opacity + force * 0.4);
            
            // Subtle attraction effect
            const angle = Math.atan2(mouseRef.current.y - y, mouseRef.current.x - x);
            star.x += Math.cos(angle) * force * 0.5;
            star.y += Math.sin(angle) * force * 0.5;
          }
        }

        // Calculate enhanced star properties
        const depth = 1 - star.z / 2000;
        const starSize = depth * star.size * (isWarpActive ? 6 : 3);
        const baseOpacity = depth * star.opacity;
        const twinkleOpacity = baseOpacity * (0.7 + 0.3 * Math.sin(star.twinkle));

        // Draw enhanced star trails for warp effect
        if (isWarpActive && star.z < 1800) {
          const trailLength = Math.min(currentSpeed * 3, 100);
          const prevX = (star.prevX - width / 2) * (perspective / (star.z + currentSpeed * 3)) + width / 2;
          const prevY = (star.prevY - height / 2) * (perspective / (star.z + currentSpeed * 3)) + height / 2;
          
          const trailGradient = ctx.createLinearGradient(prevX, prevY, x, y);
          trailGradient.addColorStop(0, `rgba(137, 207, 240, 0)`);
          trailGradient.addColorStop(0.5, `rgba(137, 207, 240, ${twinkleOpacity * 0.4})`);
          trailGradient.addColorStop(1, `rgba(255, 255, 255, ${twinkleOpacity * 0.8})`);
          
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = Math.max(0.5, starSize * 0.3);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Draw enhanced star with glow effect
        if (x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50) {
          // Outer glow
          if (starSize > 1) {
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(0.1, starSize * 3));
            glowGradient.addColorStop(0, hexToRgba(star.color, twinkleOpacity * 100 / 255));
            glowGradient.addColorStop(0.3, hexToRgba(star.color, twinkleOpacity * 50 / 255));
            glowGradient.addColorStop(1, hexToRgba(star.color, 0));
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(0.1, starSize * 3), 0, Math.PI * 2);
            ctx.fill();
          }

          // Main star body
          const starGradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(0.1, starSize));
          starGradient.addColorStop(0, `rgba(255, 255, 255, ${twinkleOpacity})`);
          starGradient.addColorStop(0.4, hexToRgba(star.color, twinkleOpacity));
          starGradient.addColorStop(1, hexToRgba(star.color, 0));
          
          ctx.fillStyle = starGradient;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.1, starSize), 0, Math.PI * 2);
          ctx.fill();

          // Enhanced sparkle effect for bright stars
          if (twinkleOpacity > 0.7 && starSize > 2) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${twinkleOpacity * 0.6})`;
            ctx.lineWidth = 0.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            
            // Cross sparkle
            const sparkleSize = starSize * 2;
            ctx.moveTo(x - sparkleSize, y);
            ctx.lineTo(x + sparkleSize, y);
            ctx.moveTo(x, y - sparkleSize);
            ctx.lineTo(x, y + sparkleSize);
            
            // Diagonal sparkle
            ctx.moveTo(x - sparkleSize * 0.7, y - sparkleSize * 0.7);
            ctx.lineTo(x + sparkleSize * 0.7, y + sparkleSize * 0.7);
            ctx.moveTo(x - sparkleSize * 0.7, y + sparkleSize * 0.7);
            ctx.lineTo(x + sparkleSize * 0.7, y - sparkleSize * 0.7);
            
            ctx.stroke();
          }
        }
      });

      // Add constellation lines for nearby stars
      if (!isWarpActive) {
        ctx.strokeStyle = 'rgba(137, 207, 240, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < starsRef.current.length; i++) {
          const star1 = starsRef.current[i];
          const x1 = (star1.x - width / 2) * (800 / star1.z) + width / 2;
          const y1 = (star1.y - height / 2) * (800 / star1.z) + height / 2;
          
          for (let j = i + 1; j < Math.min(i + 5, starsRef.current.length); j++) {
            const star2 = starsRef.current[j];
            const x2 = (star2.x - width / 2) * (800 / star2.z) + width / 2;
            const y2 = (star2.y - height / 2) * (800 / star2.z) + height / 2;
            
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            
            if (distance < 80 && star1.z < 1000 && star2.z < 1000) {
              const opacity = (1 - distance / 80) * 0.3;
              ctx.strokeStyle = `rgba(137, 207, 240, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);
    }
    
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      initStars();
    });
    
    resizeObserver.observe(canvas);

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
      }
      resizeObserver.disconnect();
    };
  }, [starCount, speed, interactive, isWarpActive]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: 'transparent',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Warp Speed Indicator */}
      {interactive && (
        <div className="absolute top-4 left-4 text-white/60 text-xs font-mono">
          {isWarpActive ? 'WARP ACTIVE' : 'CLICK TO WARP'}
        </div>
      )}
    </div>
  );
};