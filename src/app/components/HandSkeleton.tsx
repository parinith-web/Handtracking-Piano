import { forwardRef, useImperativeHandle, useRef, memo } from 'react';

export interface HandSkeletonHandle {
  updateLandmarks: (landmarks: { x: number; y: number }[] | null, activeFingers: number[]) => void;
}

interface HandSkeletonProps {
  color: string;
  handType: 'left' | 'right';
}

// MediaPipe hand connections (pairs of landmark indices)
const connections: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
];

// Fingertip indices
const fingertips = [4, 8, 12, 16, 20];

export const HandSkeleton = memo(
  forwardRef<HandSkeletonHandle, HandSkeletonProps>(({ color }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<(SVGLineElement | null)[]>([]);
    const jointGroupsRef = useRef<(SVGGElement | null)[]>([]);
    const glowCirclesRef = useRef<(SVGCircleElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      updateLandmarks: (landmarks, activeFingers) => {
        if (!containerRef.current) return;

        // Hide if no landmarks
        if (!landmarks || landmarks.length < 21) {
          containerRef.current.style.opacity = '0';
          return;
        }

        // Show container
        containerRef.current.style.opacity = '1';

        // Update connection lines directly in DOM
        connections.forEach(([fromIdx, toIdx], idx) => {
          const line = linesRef.current[idx];
          const from = landmarks[fromIdx];
          const to = landmarks[toIdx];
          
          if (line && from && to) {
            line.setAttribute('x1', String(from.x));
            line.setAttribute('y1', String(from.y));
            line.setAttribute('x2', String(to.x));
            line.setAttribute('y2', String(to.y));
          }
        });

        // Update joints directly in DOM using GPU-accelerated transforms
        landmarks.forEach((point, idx) => {
          const group = jointGroupsRef.current[idx];
          if (group) {
            // translate3d forces hardware acceleration
            group.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
          }

          // Update active glow opacity
          if (fingertips.includes(idx)) {
            const glow = glowCirclesRef.current[idx];
            if (glow) {
              const isActive = activeFingers.includes(idx);
              glow.setAttribute('opacity', isActive ? '0.6' : '0.15');
            }
          }
        });
      },
    }));

    // Pre-allocate arrays for 21 joints
    const jointsArray = Array.from({ length: 21 }, (_, i) => i);

    return (
      <div 
        ref={containerRef} 
        className="fixed inset-0 pointer-events-none z-40" 
        style={{ opacity: 0, transition: 'opacity 0.2s ease-in-out' }}
      >
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          {/* Connection lines */}
          {connections.map((_, idx) => (
            <line
              key={`line-${idx}`}
              ref={(el) => { linesRef.current[idx] = el; }}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.6"
            />
          ))}

          {/* Joint groups */}
          {jointsArray.map((idx) => {
            const isFingertip = fingertips.includes(idx);
            const size = isFingertip ? 8 : 5;

            return (
              <g 
                key={`joint-${idx}`} 
                ref={(el) => { jointGroupsRef.current[idx] = el; }}
                style={{ willChange: 'transform' }}
              >
                {/* Glow effect */}
                <circle
                  ref={(el) => {
                    if (isFingertip) glowCirclesRef.current[idx] = el;
                  }}
                  cx={0}
                  cy={0}
                  r={size + 4}
                  fill={color}
                  opacity={isFingertip ? 0.15 : 0}
                  filter="url(#glow)"
                  style={{ transition: 'opacity 0.1s ease-out' }}
                />
                {/* Main circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={size}
                  fill={color}
                  stroke={color}
                  strokeWidth="1"
                  opacity={0.9}
                />
              </g>
            );
          })}

          {/* SVG filter for glow */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    );
  })
);
