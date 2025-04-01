import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({ color = "rgba(99, 102, 241, 0.1)" }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial canvas size
    setCanvasSize();
    
    // Resize event
    window.addEventListener('resize', setCanvasSize);
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1; // Reduced size
        this.speedX = Math.random() * 0.5 - 0.25; // Reduced speed
        this.speedY = Math.random() * 0.5 - 0.25; // Reduced speed
        this.opacity = Math.random() * 0.3 + 0.1; // Reduced opacity
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      draw() {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create particles - reduced count for better performance
    const particlesArray = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
    
    // Animation loop with throttling for better performance
    let animationFrameId;
    let lastTime = 0;
    const fps = 30; // Reduced frame rate for better performance
    const fpsInterval = 1000 / fps;
    
    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Throttle the animation frame rate
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      
      lastTime = currentTime - (elapsed % fpsInterval);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
    };
    
    animate(0);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full opacity-50"
    />
  );
};

export default ParticleBackground; 