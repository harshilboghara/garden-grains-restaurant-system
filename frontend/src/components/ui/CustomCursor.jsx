import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const mouseDown = () => {
      setIsClicked(true);
      createParticles(mousePosition.x, mousePosition.y);
      setTimeout(() => setIsClicked(false), 150);
    };

    const mouseUp = () => setIsClicked(false);

    const handleHoverStart = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovered(true);
      }
    };
    
    const handleHoverEnd = () => setIsHovered(false);

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    
    // Use capture to ensuring we catch events on elements
    document.addEventListener("mouseover", handleHoverStart);
    document.addEventListener("mouseout", handleHoverEnd);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mouseover", handleHoverStart);
      document.removeEventListener("mouseout", handleHoverEnd);
    };
  }, []);

  const createParticles = (x, y) => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  };

  const variants = {
    default: {
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      height: 16,
      width: 16,
      backgroundColor: "#D4AF37",
      mixBlendMode: "normal"
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: "rgba(212, 175, 55, 0.2)",
      border: "1px solid rgba(212, 175, 55, 0.5)",
      mixBlendMode: "screen"
    }
  };

  return (
    <>
      <motion.div
        className="custom-cursor fixed top-0 left-0 bg-warm-gold rounded-full pointer-events-none z-[9999]"
        variants={variants}
        animate={isHovered ? "hover" : "default"}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
        style={{
          boxShadow: isHovered ? "0 0 20px rgba(212, 175, 55, 0.4)" : "none"
        }}
      />
      
      {/* Trailing effect */}
      <motion.div 
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-warm-gold/50 pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          mass: 0.8 // Heavier mass for delay
        }}
      />
      
      {/* Click Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, x: particle.x, y: particle.y, scale: 1 }}
            animate={{ 
              x: particle.x + particle.vx * 20, 
              y: particle.y + particle.vy * 20,
              opacity: 0,
              scale: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed w-1 h-1 bg-warm-gold rounded-full pointer-events-none z-[9999]"
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;
