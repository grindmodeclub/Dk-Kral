import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, memo } from 'react';

const BackgroundParticles = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Náhodné hodnoty sa generujú raz (nie pri každom renderi), inak častice pri každom
  // prekreslení stránky preskočia na nové miesto a zhoršujú CLS
  const particles = useMemo(
    () =>
      Array.from({ length: isMobile ? 8 : 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 60 + 20,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.03 + 0.01,
        rotate: Math.random() * 360,
        drift: Math.random() * 20 - 10,
      })),
    [isMobile]
  );

  const lines = useMemo(
    () =>
      Array.from({ length: 8 }, () => {
        const horizontal = Math.random() > 0.5;
        const length = Math.random() * 100 + 50;
        return {
          width: horizontal ? length : 1,
          height: horizontal ? 1 : length,
          left: Math.random() * 100,
          top: Math.random() * 100,
          duration: Math.random() * 10 + 8,
          delay: Math.random() * 3,
        };
      }),
    []
  );

  if (!isMounted) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute border border-gold/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
            opacity: particle.opacity,
            rotate: particle.rotate,
            willChange: 'transform',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.drift, 0],
            rotate: [0, 90, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {!isMobile && lines.map((line, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute bg-gold/20"
          style={{
            width: line.width,
            height: line.height,
            left: `${line.left}%`,
            top: `${line.top}%`,
            opacity: 0.02,
          }}
          animate={{
            opacity: [0.02, 0.05, 0.02],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            delay: line.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default memo(BackgroundParticles);
