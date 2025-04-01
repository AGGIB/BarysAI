import React from 'react';
import { motion } from 'framer-motion';
import barysLogo from '../assets/LOGO BARYSAI.svg';

const AnimatedLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-20 h-20 bg-indigo-600 rounded-full absolute"
          initial={{ scale: 0.5, opacity: 0.3 }}
          animate={{ 
            scale: [0.5, 1.2, 0.5], 
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
        />
        <motion.img
          src={barysLogo}
          alt="BarysAI"
          className="w-16 h-16 relative z-10"
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <motion.div
        className="mt-4 text-gray-700 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Жүктелуде...
      </motion.div>
    </div>
  );
};

export default AnimatedLoader; 