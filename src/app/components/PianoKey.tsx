import { motion } from 'motion/react';
import { useState } from 'react';

type KeyState = 'default' | 'active' | 'guided';

interface PianoKeyProps {
  note: string;
  index: number;
  state?: KeyState;
  activeColor?: string;
  onPress?: () => void;
}

export function PianoKey({ note, index, state = 'default', activeColor = '#FF6A3D', onPress }: PianoKeyProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isBlackKey = note.includes('b') || note.includes('#');
  
  const getKeyStyle = () => {
    switch (state) {
      case 'active':
        return {
          background: `linear-gradient(135deg, ${activeColor}40, ${activeColor}60)`,
          borderColor: activeColor,
          boxShadow: `0 0 30px ${activeColor}, 0 0 60px ${activeColor}80, inset 0 0 20px ${activeColor}40`,
        };
      case 'guided':
        return {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.3))',
          borderColor: '#3B82F6',
          boxShadow: '0 0 20px #3B82F6, 0 0 40px #3B82F680, inset 0 0 10px #3B82F640',
        };
      default:
        return {
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        };
    }
  };
  
  return (
    <motion.button
      className="relative flex flex-col items-center justify-end rounded-xl border-2 backdrop-blur-xl transition-all cursor-pointer"
      style={{
        width: isBlackKey ? '50px' : '70px',
        height: isBlackKey ? '140px' : '180px',
        ...getKeyStyle(),
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ 
        y: state === 'active' ? -5 : 0,
        opacity: 1,
        scale: state === 'active' ? 1.05 : 1,
      }}
      transition={{ 
        delay: index * 0.02,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      whileHover={{ 
        y: -3,
        scale: 1.02,
      }}
      whileTap={{ 
        y: 2,
        scale: 0.98,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPress}
    >
      {/* Guide indicator */}
      {state === 'guided' && (
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1,
          }}
        >
          <div 
            className="w-12 h-12 rounded-full border-4 backdrop-blur-sm"
            style={{
              borderColor: '#3B82F6',
              boxShadow: '0 0 20px #3B82F6, inset 0 0 10px #3B82F680',
              background: 'rgba(59, 130, 246, 0.1)',
            }}
          />
        </motion.div>
      )}
      
      {/* Note label */}
      <span 
        className="mb-4 font-medium tracking-wider"
        style={{
          color: state === 'active' ? activeColor : state === 'guided' ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px',
          textShadow: state === 'active' || state === 'guided' ? `0 0 10px currentColor` : 'none',
        }}
      >
        {note}
      </span>
      
      {/* Inner glow */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: state === 'active' 
            ? `radial-gradient(circle at 50% 100%, ${activeColor}40, transparent 70%)`
            : state === 'guided'
            ? 'radial-gradient(circle at 50% 100%, #3B82F640, transparent 70%)'
            : 'radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.1), transparent 70%)',
        }}
      />
    </motion.button>
  );
}
