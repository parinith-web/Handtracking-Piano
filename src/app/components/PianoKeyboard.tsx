import { PianoKey } from './PianoKey';
import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

export interface PianoKeyboardHandle {
  getKeyRects: () => Map<number, DOMRect>;
}

interface PianoKeyboardProps {
  activeKeyIndices?: Set<number>;
}

import { memo } from 'react';

export const PianoKeyboard = memo(forwardRef<PianoKeyboardHandle, PianoKeyboardProps>(
  function PianoKeyboard({ activeKeyIndices = new Set() }, ref) {
    const [particles, setParticles] = useState<KeyPress[]>([]);
    const keyRefsMap = useRef<Map<number, HTMLButtonElement>>(new Map());

    // Expose getKeyRects to parent
    useImperativeHandle(ref, () => ({
      getKeyRects: () => {
        const rects = new Map<number, DOMRect>();
        keyRefsMap.current.forEach((el, index) => {
          if (el) {
            rects.set(index, el.getBoundingClientRect());
          }
        });
        return rects;
      },
    }));

    // Register key element refs
    const registerKeyRef = useCallback((index: number, el: HTMLButtonElement | null) => {
      if (el) {
        keyRefsMap.current.set(index, el);
      } else {
        keyRefsMap.current.delete(index);
      }
    }, []);

    // Spawn particles when a key newly activates
    const prevActiveRef = useRef<Set<number>>(new Set());
    useEffect(() => {
      const prev = prevActiveRef.current;
      activeKeyIndices.forEach((index) => {
        if (!prev.has(index)) {
          const el = keyRefsMap.current.get(index);
          if (el) {
            const rect = el.getBoundingClientRect();
            const color = index % 2 === 0 ? '#3B82F6' : '#FF6A3D';
            const id = Date.now() + index;
            setParticles((p) => [...p, { id, x: rect.left + rect.width / 2, y: rect.top, color }]);
            setTimeout(() => {
              setParticles((p) => p.filter((pp) => pp.id !== id));
            }, 1200);
          }
        }
      });
      prevActiveRef.current = new Set(activeKeyIndices);
    }, [activeKeyIndices]);

    const handleKeyPress = useCallback((index: number, event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const color = index % 2 === 0 ? '#3B82F6' : '#FF6A3D';

      const id = Date.now();
      setParticles((prev) => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top, color }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 1200);
    }, []);

    const getKeyState = (index: number): 'default' | 'active' | 'guided' => {
      if (activeKeyIndices.has(index)) return 'active';
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
                registerRef={(el) => registerKeyRef(index, el)}
              />
            ))}
          </div>
        </div>

        {/* Particle effects */}
        {particles.map((particle) => (
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
));
