import { motion } from 'framer-motion';

const SwipeHint = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        x: [-20, 20, -20],
        opacity: [0, 0.7, 0.5, 0.7, 0]
      }}
      transition={{
        duration: 6,
        times: [0, 0.15, 0.5, 0.85, 1],
        ease: "easeInOut"
      }}
      className="pointer-events-none flex items-center justify-center"
    >
      <img
        src="/swipe_icon.png"
        alt="Swipe"
        className="w-auto h-auto max-w-[120px] md:max-w-[150px] object-contain"
        style={{ filter: 'invert(1) brightness(2)' }}
      />
    </motion.div>
  );
};

export default SwipeHint;
