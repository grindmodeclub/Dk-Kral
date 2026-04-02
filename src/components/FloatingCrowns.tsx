import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Crown {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  pulseDuration: number;
  delay: number;
  opacity: number;
}

interface CrownPosition {
  x: number;
  y: number;
  rot: number;
  size?: 'small' | 'medium' | 'large';
  opacityLevel?: 'light' | 'normal' | 'dark';
}

const crownPositions: CrownPosition[] = [
  { x: 2, y: 5, rot: -35, size: 'small', opacityLevel: 'light' },
  { x: 78, y: 2, rot: 45, size: 'medium' },
  { x: 8, y: 55, rot: 15, opacityLevel: 'dark' },
  { x: 85, y: 50, rot: -55, size: 'medium' },
  { x: 42, y: 20, rot: 70, size: 'small', opacityLevel: 'light' },
  { x: 65, y: 72, rot: -25, size: 'large', opacityLevel: 'light' },
  { x: 20, y: 82, rot: 40, opacityLevel: 'dark' },
  { x: 92, y: 25, rot: -70, size: 'small' },
  { x: 55, y: 90, rot: 25, size: 'medium', opacityLevel: 'light' },
  { x: 30, y: 35, rot: -45 },
  { x: 15, y: 42, rot: 55, size: 'medium', opacityLevel: 'dark' },
  { x: 72, y: 38, rot: -40, size: 'small', opacityLevel: 'light' },
  { x: 32, y: 58, rot: 30, size: 'large', opacityLevel: 'light' },
  { x: 58, y: 64, rot: -65, size: 'large', opacityLevel: 'light' },
  { x: 45, y: 72, rot: 22, size: 'large', opacityLevel: 'light' },
  { x: 12, y: 75, rot: -30, size: 'medium', opacityLevel: 'dark' },
  { x: 88, y: 78, rot: 50, size: 'small', opacityLevel: 'light' },
  { x: 5, y: 28, rot: -80, size: 'small', opacityLevel: 'light' },
  { x: 95, y: 65, rot: 35, size: 'medium' },
  { x: 25, y: 12, rot: -20, size: 'small', opacityLevel: 'dark' },
];

const getSizeRange = (sizeType?: 'small' | 'medium' | 'large'): [number, number] => {
  switch (sizeType) {
    case 'small': return [70, 110];
    case 'large': return [180, 240];
    default: return [110, 160];
  }
};

const getOpacityRange = (opacityLevel?: 'light' | 'normal' | 'dark'): [number, number] => {
  switch (opacityLevel) {
    case 'light': return [0.08, 0.12];
    case 'dark': return [0.22, 0.28];
    default: return [0.14, 0.20];
  }
};

const generateCrowns = (): Crown[] => {
  return crownPositions.map((pos, i) => {
    const [minSize, maxSize] = getSizeRange(pos.size);
    const [minOpacity, maxOpacity] = getOpacityRange(pos.opacityLevel);
    const isLarge = pos.size === 'large';

    return {
      id: i,
      x: pos.x,
      y: pos.y,
      size: minSize + Math.random() * (maxSize - minSize),
      rotation: pos.rot + (Math.random() * 30 - 15),
      pulseDuration: isLarge ? 4.5 + Math.random() * 2 : 3 + Math.random() * 2,
      delay: i * 0.2,
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
    };
  });
};

const crowns = generateCrowns();

const mobileCrownPositions: CrownPosition[] = [
  {
    x: 12 + Math.random() * 20,
    y: 30 + Math.random() * 15,
    rot: Math.random() * 360 - 180,
    size: Math.random() > 0.5 ? 'medium' : 'small',
    opacityLevel: Math.random() > 0.6 ? 'light' : 'normal'
  },
  {
    x: 65 + Math.random() * 25,
    y: 65 + Math.random() * 20,
    rot: Math.random() * 360 - 180,
    size: Math.random() > 0.3 ? 'medium' : 'large',
    opacityLevel: Math.random() > 0.5 ? 'light' : 'normal'
  }
];

const generateMobileCrowns = (): Crown[] => {
  return mobileCrownPositions.map((pos, i) => {
    const [minSize, maxSize] = getSizeRange(pos.size);
    const [minOpacity, maxOpacity] = getOpacityRange(pos.opacityLevel);
    const isLarge = pos.size === 'large';

    const baseSize = minSize + Math.random() * (maxSize - minSize);
    const variance = baseSize * 0.3;
    const finalSize = baseSize + (Math.random() * variance * 2 - variance);

    return {
      id: 1000 + i,
      x: pos.x,
      y: pos.y,
      size: finalSize,
      rotation: pos.rot + (Math.random() * 60 - 30),
      pulseDuration: isLarge ? 4.5 + Math.random() * 2 : 3 + Math.random() * 2,
      delay: (i + 4) * 0.2,
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
    };
  });
};

const mobileCrowns = generateMobileCrowns();

const FloatingCrowns = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMounted) {
    return <div className="absolute inset-0 bg-white overflow-hidden" />;
  }

  const displayedCrowns = isMobile ? [...crowns.slice(0, 4), ...mobileCrowns] : crowns;

  return (
    <div className="absolute inset-0 bg-white overflow-hidden">
      {displayedCrowns.map((crown) => (
        <motion.div
          key={crown.id}
          className="absolute will-change-transform"
          style={{
            left: `${crown.x}%`,
            top: `${crown.y}%`,
            rotate: crown.rotation,
            opacity: crown.opacity,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [crown.opacity, crown.opacity * 1.4, crown.opacity],
          }}
          transition={{
            duration: crown.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: crown.delay,
          }}
        >
          <img
            src="/korunka_gold.png"
            alt=""
            style={{ width: crown.size, height: 'auto' }}
            className="select-none pointer-events-none"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingCrowns;
