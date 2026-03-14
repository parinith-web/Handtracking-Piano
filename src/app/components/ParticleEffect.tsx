import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
}

interface ParticleEffectProps {
  color: string;
  x: number;
  y: number;
}

export function ParticleEffect({ color, x, y }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      delay: Math.random() * 0.1,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
          initial={{ 
            opacity: 1, 
            y: 0, 
            x: 0,
            scale: 1 
          }}
          animate={{ 
            opacity: 0, 
            y: -80, 
            x: particle.x,
            scale: 0 
          }}
          transition={{ 
            duration: 1.2, 
            delay: particle.delay,
            ease: 'easeOut' 
          }}
        />
      ))}
    </div>
  );
}
