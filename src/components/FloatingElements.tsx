import React, { useEffect, useRef, useState } from 'react';

interface FloatingElement {
  id: string;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  opacity: number;
  speed: number;
  type: 'cube' | 'sphere' | 'pyramid' | 'ring' | 'hexagon' | 'diamond';
  color: string;
  glowIntensity: number;
}

interface FloatingElementsProps {
  className?: string;
  elementCount?: number;
  interactive?: boolean;
  depth?: number;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({
  className = '',
  elementCount = 25,
  interactive = true,
  depth = 1000
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, influence: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize floating elements with enhanced properties
    const initElements = () => {
      const colors = [
        '#89CFF0', // Primary blue
        '#F0FFFF', // Light cyan  
        '#87CEEB', // Sky blue
        '#B0E0E6', // Powder blue
        '#E0F6FF', // Alice blue
        '#ffffff'  // White
      ];

      elementsRef.current = Array.from({ length: elementCount }, (_, i) => ({
        id: `element-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * depth + 100,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.8 + 0.3,
        type: ['cube', 'sphere', 'pyramid', 'ring', 'hexagon', 'diamond'][Math.floor(Math.random() * 6)] as FloatingElement['type'],
        color: colors[Math.floor(Math.random() * colors.length)],
        glowIntensity: Math.random() * 0.5 + 0.3
      }));
    };

    initElements();

    // Enhanced mouse interaction with momentum
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      
      const rect = container.getBoundingClientRect();
      const targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      
      // Smooth mouse following with momentum
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.1;
      mouseRef.current.influence = Math.min(1, mouseRef.current.influence + 0.05);
      
      setIsInteracting(true);
    };

    const handleMouseLeave = () => {
      setIsInteracting(false);
      mouseRef.current.influence *= 0.95;
    };

    // Enhanced animation loop with Starlink-inspired physics
    const animate = () => {
      elementsRef.current.forEach((element, index) => {
        // Enhanced rotation with variable speeds
        element.rotationX += element.speed * 0.7;
        element.rotationY += element.speed * 0.5;
        element.rotationZ += element.speed * 0.3;

        // Complex floating movement with multiple wave patterns
        const time = Date.now() * 0.001;
        const baseY = Math.sin(time * 0.5 + index * 0.3) * 2;
        const baseX = Math.cos(time * 0.3 + index * 0.5) * 1.5;
        
        element.y += baseY * 0.02;
        element.x += baseX * 0.01;

        // Enhanced mouse interaction with physics
        if (interactive && isInteracting) {
          const mouseInfluence = 0.15 * mouseRef.current.influence;
          const distanceFromMouse = Math.sqrt(
            Math.pow(element.x - (mouseRef.current.x * 50 + 50), 2) +
            Math.pow(element.y - (mouseRef.current.y * 50 + 50), 2)
          );
          
          if (distanceFromMouse < 30) {
            const force = (30 - distanceFromMouse) / 30;
            element.x += mouseRef.current.x * mouseInfluence * force;
            element.y += mouseRef.current.y * mouseInfluence * force;
            element.glowIntensity = Math.min(1, element.glowIntensity + force * 0.3);
            element.scale = Math.min(1.5, element.scale + force * 0.2);
          } else {
            element.glowIntensity *= 0.98;
            element.scale = Math.max(0.2, element.scale * 0.99);
          }
        } else {
          element.glowIntensity *= 0.99;
          element.scale = Math.max(0.2, element.scale * 0.995);
        }

        // Boundary wrapping with smooth transitions
        if (element.x > 110) element.x = -10;
        if (element.x < -10) element.x = 110;
        if (element.y > 110) element.y = -10;
        if (element.y < -10) element.y = 110;

        // Update DOM element with enhanced 3D transforms
        const domElement = container.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;
        if (domElement) {
          const perspective = 1200;
          const translateZ = element.z * (isInteracting ? 0.8 : 1);
          const finalScale = element.scale * (1 + element.glowIntensity * 0.3);
          
          domElement.style.transform = `
            translate3d(${element.x}vw, ${element.y}vh, ${translateZ}px)
            rotateX(${element.rotationX}deg)
            rotateY(${element.rotationY}deg)
            rotateZ(${element.rotationZ}deg)
            scale(${finalScale})
          `;
          domElement.style.opacity = (element.opacity * (0.7 + element.glowIntensity * 0.3)).toString();
          
          // Dynamic glow effect
          const glowIntensity = element.glowIntensity;
          domElement.style.filter = `
            drop-shadow(0 0 ${glowIntensity * 20}px ${element.color}40)
            brightness(${1 + glowIntensity * 0.5})
          `;
        }
      });

      // Reduce mouse influence over time
      if (!isInteracting) {
        mouseRef.current.influence *= 0.95;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Create enhanced DOM elements with better 3D shapes
    const createDOMElements = () => {
      container.innerHTML = '';
      
      elementsRef.current.forEach(element => {
        const div = document.createElement('div');
        div.setAttribute('data-element-id', element.id);
        div.className = `absolute pointer-events-none transition-all duration-300 ease-out`;
        div.style.transformStyle = 'preserve-3d';
        
        // Create enhanced 3D shapes with better styling
        let shapeHTML = '';
        const size = 24;
        const colorWithOpacity = `${element.color}60`;
        const borderColor = `${element.color}80`;
        
        switch (element.type) {
          case 'cube':
            shapeHTML = `
              <div class="relative" style="width: ${size}px; height: ${size}px; transform-style: preserve-3d;">
                <div class="absolute rounded-sm border" 
                     style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, ${colorWithOpacity}, ${element.color}40); border-color: ${borderColor}; transform: translateZ(${size/2}px);"></div>
                <div class="absolute rounded-sm border" 
                     style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, ${element.color}40, ${element.color}20); border-color: ${borderColor}; transform: rotateY(90deg) translateZ(${size/2}px);"></div>
                <div class="absolute rounded-sm border" 
                     style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, ${element.color}50, ${element.color}30); border-color: ${borderColor}; transform: rotateX(90deg) translateZ(${size/2}px);"></div>
              </div>
            `;
            break;
          case 'sphere':
            shapeHTML = `
              <div class="rounded-full border-2 shadow-lg" 
                   style="width: ${size}px; height: ${size}px; background: radial-gradient(circle at 30% 30%, ${element.color}80, ${element.color}40); border-color: ${borderColor};"></div>
            `;
            break;
          case 'pyramid':
            shapeHTML = `
              <div class="relative" style="width: ${size}px; height: ${size}px;">
                <div class="absolute" style="
                  width: 0; 
                  height: 0; 
                  border-left: ${size/2}px solid transparent;
                  border-right: ${size/2}px solid transparent;
                  border-bottom: ${size}px solid ${colorWithOpacity};
                  transform: translateX(-50%);
                  filter: drop-shadow(0 2px 4px ${element.color}40);
                "></div>
              </div>
            `;
            break;
          case 'ring':
            shapeHTML = `
              <div class="relative" style="width: ${size}px; height: ${size}px;">
                <div class="absolute inset-0 rounded-full border-3" style="border-color: ${borderColor}; background: radial-gradient(circle, transparent 40%, ${colorWithOpacity} 60%);"></div>
                <div class="absolute inset-2 rounded-full border" style="border-color: ${element.color}60;"></div>
              </div>
            `;
            break;
          case 'hexagon':
            shapeHTML = `
              <div class="relative" style="width: ${size}px; height: ${size}px;">
                <div style="
                  width: ${size}px;
                  height: ${size * 0.866}px;
                  background: linear-gradient(135deg, ${colorWithOpacity}, ${element.color}40);
                  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
                  border: 1px solid ${borderColor};
                "></div>
              </div>
            `;
            break;
          case 'diamond':
            shapeHTML = `
              <div class="relative" style="width: ${size}px; height: ${size}px;">
                <div style="
                  width: ${size}px;
                  height: ${size}px;
                  background: linear-gradient(45deg, ${colorWithOpacity}, ${element.color}40);
                  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                  border: 1px solid ${borderColor};
                "></div>
              </div>
            `;
            break;
        }
        
        div.innerHTML = shapeHTML;
        container.appendChild(div);
      });
    };

    createDOMElements();

    // Event listeners
    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    
    window.addEventListener('resize', () => {
      initElements();
      createDOMElements();
    });

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      window.removeEventListener('resize', initElements);
    };
  }, [elementCount, interactive, depth]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ 
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
    />
  );
};