import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Enhanced3DSceneProps {
  className?: string;
  interactive?: boolean;
  intensity?: number;
}

export const Enhanced3DScene: React.FC<Enhanced3DSceneProps> = ({
  className = '',
  interactive = true,
  intensity = 1
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000510, 100, 2000);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      camera.position.set(0, 0, 100);
      cameraRef.current = camera;

      // Renderer setup with enhanced settings
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Create Starlink-inspired geometric elements
      const createGeometricElements = () => {
        // Floating geometric shapes
        const geometries = [
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.SphereGeometry(1.5, 16, 16),
          new THREE.ConeGeometry(1, 3, 8),
          new THREE.RingGeometry(1, 2, 16),
          new THREE.OctahedronGeometry(1.5),
          new THREE.TetrahedronGeometry(1.5)
        ];

        const materials = [
          new THREE.MeshPhongMaterial({ 
            color: 0x89CFF0, 
            transparent: true, 
            opacity: 0.6,
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0xF0FFFF, 
            transparent: true, 
            opacity: 0.4,
            shininess: 80
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.5,
            shininess: 90
          })
        ];

        // Create floating elements
        for (let i = 0; i < 30; i++) {
          const geometry = geometries[Math.floor(Math.random() * geometries.length)];
          const material = materials[Math.floor(Math.random() * materials.length)].clone();
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Random positioning
          mesh.position.set(
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
          );
          
          // Random rotation
          mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          );
          
          // Store animation properties
          (mesh as any).userData = {
            originalPosition: mesh.position.clone(),
            rotationSpeed: {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatRange: Math.random() * 20 + 10
          };
          
          scene.add(mesh);
        }
      };

      // Create particle system
      const createParticleSystem = () => {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          
          // Position
          positions[i3] = (Math.random() - 0.5) * 2000;
          positions[i3 + 1] = (Math.random() - 0.5) * 2000;
          positions[i3 + 2] = (Math.random() - 0.5) * 2000;
          
          // Color (blue spectrum)
          color.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5 + Math.random() * 0.5);
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
          
          // Size
          sizes[i] = Math.random() * 3 + 1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            pixelRatio: { value: window.devicePixelRatio }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
              float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
              gl_FragColor = vec4(vColor, alpha * 0.8);
            }
          `,
          transparent: true,
          vertexColors: true,
          blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        return { particleSystem, particleMaterial };
      };

      // Create lighting
      const createLighting = () => {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0x89CFF0, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Point lights for dynamic effects
        const pointLight1 = new THREE.PointLight(0xF0FFFF, 0.8, 200);
        pointLight1.position.set(100, 100, 100);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x87CEEB, 0.6, 150);
        pointLight2.position.set(-100, -100, 50);
        scene.add(pointLight2);

        return { directionalLight, pointLight1, pointLight2 };
      };

      // Initialize scene elements
      createGeometricElements();
      const { particleSystem, particleMaterial } = createParticleSystem();
      const { directionalLight, pointLight1, pointLight2 } = createLighting();

      // Mouse interaction
      const handleMouseMove = (event: MouseEvent) => {
        if (!interactive) return;
        
        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      // Animation loop
      const animate = () => {
        const time = Date.now() * 0.001;
        
        // Update particle system
        if (particleMaterial.uniforms.time) {
          particleMaterial.uniforms.time.value = time;
        }

        // Animate geometric elements
        scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData) {
            const userData = child.userData;
            
            // Rotation animation
            child.rotation.x += userData.rotationSpeed.x * intensity;
            child.rotation.y += userData.rotationSpeed.y * intensity;
            child.rotation.z += userData.rotationSpeed.z * intensity;
            
            // Floating animation
            const floatOffset = Math.sin(time * userData.floatSpeed) * userData.floatRange;
            child.position.y = userData.originalPosition.y + floatOffset;
            
            // Mouse interaction
            if (interactive) {
              const mouseInfluence = 0.1;
              child.position.x += mouseRef.current.x * mouseInfluence;
              child.position.z += mouseRef.current.y * mouseInfluence;
            }
          }
        });

        // Animate lights
        pointLight1.position.x = Math.sin(time * 0.5) * 100;
        pointLight1.position.z = Math.cos(time * 0.5) * 100;
        
        pointLight2.position.x = Math.cos(time * 0.3) * 80;
        pointLight2.position.y = Math.sin(time * 0.4) * 60;

        // Camera movement based on mouse
        if (interactive) {
          camera.position.x += (mouseRef.current.x * 20 - camera.position.x) * 0.05;
          camera.position.y += (-mouseRef.current.y * 20 - camera.position.y) * 0.05;
          camera.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
        animationRef.current = requestAnimationFrame(animate);
      };

      // Handle resize
      const handleResize = () => {
        if (!camera || !renderer) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      // Event listeners
      if (interactive) {
        window.addEventListener('mousemove', handleMouseMove);
      }
      window.addEventListener('resize', handleResize);

      // Start animation
      animate();
      setIsLoaded(true);

      return () => {
        // Cleanup
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (interactive) {
          window.removeEventListener('mousemove', handleMouseMove);
        }
        window.removeEventListener('resize', handleResize);
        
        // Dispose of Three.js resources
        scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        
        renderer.dispose();
        
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };

    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
      setIsLoaded(false);
    }
  }, [interactive, intensity]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        opacity: isLoaded ? 0.6 : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  );
};