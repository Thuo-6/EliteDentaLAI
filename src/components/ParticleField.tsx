import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'dot' | 'line' | 'triangle';
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
  intensity?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  className = '',
  particleCount = 150,
  interactive = true,
  intensity = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, pressed: false });
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas with proper scaling
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

    // Initialize particles with enhanced properties
    const initParticles = () => {
      const colors = ['#89CFF0', '#F0FFFF', '#87CEEB', '#B0E0E6', '#ffffff'];
      
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * dimensionsRef.current.width,
        y: Math.random() * dimensionsRef.current.height,
        z: Math.random() * 500 + 50,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: Math.random() * 2 + 1,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        life: Math.random() * 100,
        maxLife: Math.random() * 200 + 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: ['dot', 'line', 'triangle'][Math.floor(Math.random() * 3)] as Particle['type']
      }));
    };

    initParticles();

    // Mouse interaction handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      setIsActive(true);
    };

    const handleMouseDown = () => {
      mouseRef.current.pressed = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.pressed = false;
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      mouseRef.current.pressed = false;
    };

    // Enhanced animation with particle physics
    const animate = () => {
      const { width, height } = dimensionsRef.current;
      
      // Clear canvas with subtle gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      bgGradient.addColorStop(1, 'rgba(0, 10, 20, 0.1)');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update particle physics
        particle.x += particle.vx * intensity;
        particle.y += particle.vy * intensity;
        particle.z += particle.vz * intensity;
        particle.life += 1;

        // Mouse interaction forces
        if (interactive && isActive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            
            if (mouseRef.current.pressed) {
              // Attraction when mouse pressed
              particle.vx += (dx / distance) * force * 0.5;
              particle.vy += (dy / distance) * force * 0.5;
            } else {
              // Repulsion on hover
              particle.vx -= (dx / distance) * force * 0.3;
              particle.vy -= (dy / distance) * force * 0.3;
            }
            
            particle.opacity = Math.min(1, particle.opacity + force * 0.3);
            particle.size = Math.min(8, particle.size + force * 2);
          }
        }

        // Apply velocity damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        particle.vz *= 0.995;

        // Boundary conditions with wrapping
        if (particle.x < 0 || particle.x > width) {
          particle.x = particle.x < 0 ? width : 0;
          particle.vx *= -0.8;
        }
        if (particle.y < 0 || particle.y > height) {
          particle.y = particle.y < 0 ? height : 0;
          particle.vy *= -0.8;
        }
        if (particle.z <= 0 || particle.z > 500) {
          particle.z = particle.z <= 0 ? 500 : 50;
          particle.vz *= -0.8;
        }

        // Respawn particles at end of life
        if (particle.life > particle.maxLife) {
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          particle.z = Math.random() * 500 + 50;
          particle.vx = (Math.random() - 0.5) * 2;
          particle.vy = (Math.random() - 0.5) * 2;
          particle.vz = Math.random() * 2 + 1;
          particle.life = 0;
          particle.opacity = Math.random() * 0.8 + 0.2;
          particle.size = Math.random() * 4 + 1;
        }

        // Calculate depth-based properties
        const depth = 1 - particle.z / 500;
        const finalSize = particle.size * depth;
        const finalOpacity = particle.opacity * depth * (1 - particle.life / particle.maxLife);

        // Draw particle based on type
        if (finalOpacity > 0.01 && finalSize > 0.1) {
          ctx.save();
          ctx.globalAlpha = finalOpacity;
          
          switch (particle.type) {
            case 'dot':
              const dotGradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, finalSize
              );
              dotGradient.addColorStop(0, particle.color);
              dotGradient.addColorStop(1, `${particle.color}00`);
              
              ctx.fillStyle = dotGradient;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'line':
              ctx.strokeStyle = particle.color;
              ctx.lineWidth = finalSize * 0.5;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(particle.x - finalSize, particle.y);
              ctx.lineTo(particle.x + finalSize, particle.y);
              ctx.stroke();
              break;
              
            case 'triangle':
              ctx.fillStyle = particle.color;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y - finalSize);
              ctx.lineTo(particle.x - finalSize * 0.866, particle.y + finalSize * 0.5);
              ctx.lineTo(particle.x + finalSize * 0.866, particle.y + finalSize * 0.5);
              ctx.closePath();
              ctx.fill();
              break;
          }
          
          ctx.restore();
        }
      });

      // Draw connection lines between nearby particles
      if (isActive) {
        ctx.strokeStyle = 'rgba(137, 207, 240, 0.2)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particlesRef.current.length; i++) {
          const p1 = particlesRef.current[i];
          
          for (let j = i + 1; j < Math.min(i + 8, particlesRef.current.length); j++) {
            const p2 = particlesRef.current[j];
            const distance = Math.sqrt(
              Math.pow(p2.x - p1.x, 2) + 
              Math.pow(p2.y - p1.y, 2)
            );
            
            if (distance < 120) {
              const opacity = (1 - distance / 120) * 0.5;
              ctx.globalAlpha = opacity;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      initParticles();
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
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      resizeObserver.disconnect();
    };
  }, [particleCount, interactive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ 
        background: 'transparent',
        mixBlendMode: 'screen'
      }}
    />
  );
};