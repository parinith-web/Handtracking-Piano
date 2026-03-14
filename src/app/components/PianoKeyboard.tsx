import { PianoKey } from './PianoKey';
import { useState, useCallback } from 'react';
import { ParticleEffect } from './ParticleEffect';

interface KeyPress {
  id: number;
  x: number;
  y: number;
  color: string;
}

const notes = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'C', 'C#', 'D', 'D#', 'E',
];

const guidedKeys = [0, 4, 7, 12, 16, 19]; // Example guided keys for demo
const activeKeys = [12, 16]; // Example active keys for demo

export function PianoKeyboard() {
  const [particles, setParticles] = useState<KeyPress[]>([]);
  
  const handleKeyPress = useCallback((index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const color = index % 2 === 0 ? '#3B82F6' : '#FF6A3D'; // Alternate colors for demo
    
    setParticles(prev => [...prev, {
      id: Date.now(),
      x: rect.left + rect.width / 2,
      y: rect.top,
      color,
    }]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== Date.now()));
    }, 1200);
  }, []);
  
  const getKeyState = (index: number): 'default' | 'active' | 'guided' => {
    if (activeKeys.includes(index)) return 'active';
    if (guidedKeys.includes(index)) return 'guided';
    return 'default';
  };
  
  const getActiveColor = (index: number): string => {
    return index % 2 === 0 ? '#3B82F6' : '#FF6A3D';
  };
  
  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="flex items-end gap-2 px-8 py-6 backdrop-blur-md bg-black/20 rounded-3xl border border-white/10 shadow-2xl">
          {notes.map((note, index) => (
            <PianoKey
              key={`${note}-${index}`}
              note={note}
              index={index}
              state={getKeyState(index)}
              activeColor={getActiveColor(index)}
              onPress={(e: any) => handleKeyPress(index, e)}
            />
          ))}
        </div>
      </div>
      
      {/* Particle effects */}
      {particles.map(particle => (
        <ParticleEffect
          key={particle.id}
          color={particle.color}
          x={particle.x}
          y={particle.y}
        />
      ))}
    </>
  );
}
