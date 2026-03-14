import { motion } from 'motion/react';

interface Joint {
  x: number;
  y: number;
}

interface Connection {
  from: number;
  to: number;
}

interface HandSkeletonProps {
  color: string;
  handType: 'left' | 'right';
  position: { x: number; y: number };
  activeFingers?: number[];
}

// Define hand skeleton structure
const joints: Joint[] = [
  // Wrist
  { x: 0, y: 0 },
  
  // Thumb
  { x: 20, y: 10 },
  { x: 35, y: 15 },
  { x: 50, y: 18 },
  { x: 65, y: 20 },
  
  // Index finger
  { x: 30, y: -10 },
  { x: 50, y: -20 },
  { x: 70, y: -30 },
  { x: 90, y: -40 },
  
  // Middle finger
  { x: 35, y: -5 },
  { x: 60, y: -15 },
  { x: 85, y: -25 },
  { x: 110, y: -35 },
  
  // Ring finger
  { x: 30, y: 0 },
  { x: 55, y: -5 },
  { x: 80, y: -10 },
  { x: 100, y: -15 },
  
  // Pinky
  { x: 20, y: 5 },
  { x: 40, y: 5 },
  { x: 60, y: 3 },
  { x: 75, y: 0 },
];

const connections: Connection[] = [
  // Thumb
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  
  // Index
  { from: 0, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  
  // Middle
  { from: 0, to: 9 },
  { from: 9, to: 10 },
  { from: 10, to: 11 },
  { from: 11, to: 12 },
  
  // Ring
  { from: 0, to: 13 },
  { from: 13, to: 14 },
  { from: 14, to: 15 },
  { from: 15, to: 16 },
  
  // Pinky
  { from: 0, to: 17 },
  { from: 17, to: 18 },
  { from: 18, to: 19 },
  { from: 19, to: 20 },
];

// Fingertip indices
const fingertips = [4, 8, 12, 16, 20];

export function HandSkeleton({ color, handType, position, activeFingers = [] }: HandSkeletonProps) {
  const transform = handType === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg width="200" height="200" className="overflow-visible">
        {/* Connection lines */}
        {connections.map((conn, idx) => {
          const from = joints[conn.from];
          const to = joints[conn.to];
          return (
            <motion.line
              key={`line-${idx}`}
              x1={from.x + 100}
              y1={from.y + 100}
              x2={to.x + 100}
              y2={to.y + 100}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.02 }}
            />
          );
        })}
        
        {/* Joint circles */}
        {joints.map((joint, idx) => {
          const isFingertip = fingertips.includes(idx);
          const isActive = activeFingers.includes(idx);
          const size = isFingertip ? 8 : 6;
          
          return (
            <motion.g key={`joint-${idx}`}>
              {/* Glow effect */}
              <circle
                cx={joint.x + 100}
                cy={joint.y + 100}
                r={size + 4}
                fill={color}
                opacity={isFingertip && isActive ? 0.6 : 0.2}
                filter="blur(4px)"
              />
              {/* Main circle */}
              <motion.circle
                cx={joint.x + 100}
                cy={joint.y + 100}
                r={size}
                fill={color}
                stroke={color}
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: isFingertip && isActive ? [1, 1.3, 1] : 1 
                }}
                transition={{ 
                  duration: 0.5,
                  delay: idx * 0.02,
                  repeat: isFingertip && isActive ? Infinity : 0,
                  repeatDelay: 0.3
                }}
              />
            </motion.g>
          );
        })}
        
        {/* Motion trail for fingertips */}
        {fingertips.map((idx) => {
          if (!activeFingers.includes(idx)) return null;
          const joint = joints[idx];
          return (
            <motion.circle
              key={`trail-${idx}`}
              cx={joint.x + 100}
              cy={joint.y + 100}
              r={12}
              fill={color}
              opacity={0.1}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}
