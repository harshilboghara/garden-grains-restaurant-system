import React, { useEffect, useRef } from 'react';

const BackgroundParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create particles
    const createParticles = () => {
      const particleCount = window.innerWidth < 768 ? 30 : 80;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedY: Math.random() * 0.3 + 0.1,
          speedX: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.1,
          blur: Math.random() > 0.5
        });
      }
    };

    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`; // Warm gold color
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Optional blur for depth effect
        if (p.blur) {
            ctx.shadowBlur = 2;
            ctx.shadowColor = "rgba(212, 175, 55, 0.3)";
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();

        // Update position
        p.y -= p.speedY; // Move up slowly
        p.x += p.speedX;

        // Reset if out of bounds
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
    />
  );
};

export default BackgroundParticles;
