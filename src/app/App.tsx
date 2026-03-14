import { useCallback, useRef, useState, useEffect } from 'react';
import { PianoKeyboard, PianoKeyboardHandle } from './components/PianoKeyboard';
import { HandSkeleton, HandSkeletonHandle } from './components/HandSkeleton';
import { StartScreen } from './components/StartScreen';
import { motion } from 'motion/react';
import CameraFeed from './components/CameraFeed';
import { ensureAudioStarted, playNote, releaseNote } from './soundEngine';

// Fingertip landmark indices in MediaPipe hand model
const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

function App() {
  const [started, setStarted] = useState(false);
  const [activeKeyIndices, setActiveKeyIndices] = useState<Set<number>>(new Set());
  const [audioReady, setAudioReady] = useState(false);

  // Refs for imperative DOM updates (avoids React re-renders on every frame)
  const pianoRef = useRef<PianoKeyboardHandle>(null);
  const leftSkeletonRef = useRef<HandSkeletonHandle>(null);
  const rightSkeletonRef = useRef<HandSkeletonHandle>(null);
  const prevActiveKeysRef = useRef<Set<number>>(new Set());

  // Store the latest results for the animation frame loop
  const latestResultsRef = useRef<any>(null);
  const animationFrameId = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Start audio on first user click (browser autoplay policy)
  const handleUserGesture = useCallback(async () => {
    if (!audioReady) {
      await ensureAudioStarted();
      setAudioReady(true);
    }
  }, [audioReady]);

  // Just store the results; don't trigger a render
  const handleResults = useCallback((results: any) => {
    latestResultsRef.current = results;
  }, []);

  // Process physics and DOM updates in requestAnimationFrame for 60fps
  useEffect(() => {
    if (!started) return;

    const processFrame = () => {
      const now = performance.now();
      // Throttle heavy processing to ~60fps max
      if (now - lastUpdateRef.current < 16) {
        animationFrameId.current = requestAnimationFrame(processFrame);
        return;
      }
      lastUpdateRef.current = now;

      const results = latestResultsRef.current;
      
      if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        // Hide skeletons
        leftSkeletonRef.current?.updateLandmarks(null, []);
        rightSkeletonRef.current?.updateLandmarks(null, []);

        // Release all notes if hands disappear
        if (prevActiveKeysRef.current.size > 0) {
          prevActiveKeysRef.current.forEach((idx) => releaseNote(idx));
          prevActiveKeysRef.current = new Set();
          setActiveKeyIndices(new Set()); // Only trigger render when keys change
        }
      } else {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let leftPoints: { x: number; y: number }[] | null = null;
        let rightPoints: { x: number; y: number }[] | null = null;
        const activeFingersLeft: number[] = [];
        const activeFingersRight: number[] = [];

        // Collision detection
        const keyRects = pianoRef.current?.getKeyRects();
        const newActiveKeys = new Set<number>();

        results.multiHandLandmarks.forEach((landmarks: any[], handIdx: number) => {
          // Convert normalized coords to screen pixels (mirrored x)
          const points = landmarks.map((lm: any) => ({
            x: (1 - lm.x) * width,
            y: lm.y * height,
          }));

          const handedness = results.multiHandedness?.[handIdx];
          const label = handedness?.label || (handIdx === 0 ? 'Right' : 'Left');

          // Check collisions
          if (keyRects) {
            FINGERTIP_INDICES.forEach((fi) => {
              const pt = points[fi];
              if (!pt) return;

              keyRects.forEach((rect, keyIndex) => {
                if (
                  pt.x >= rect.left &&
                  pt.x <= rect.right &&
                  pt.y >= rect.top &&
                  pt.y <= rect.bottom
                ) {
                  newActiveKeys.add(keyIndex);
                  if (label === 'Right') activeFingersLeft.push(fi);
                  else activeFingersRight.push(fi);
                }
              });
            });
          }

          if (label === 'Right') leftPoints = points;
          else rightPoints = points;
        });

        // Imperatively update skeleton DOM (no React render)
        leftSkeletonRef.current?.updateLandmarks(leftPoints, activeFingersLeft);
        rightSkeletonRef.current?.updateLandmarks(rightPoints, activeFingersRight);

        // Diff keys for sound synthesis
        const prev = prevActiveKeysRef.current;
        let changed = false;

        newActiveKeys.forEach((idx) => {
          if (!prev.has(idx)) {
            playNote(idx);
            changed = true;
          }
        });

        prev.forEach((idx) => {
          if (!newActiveKeys.has(idx)) {
            releaseNote(idx);
            changed = true;
          }
        });

        // Only update React state if the active keys actually changed
        if (changed) {
          prevActiveKeysRef.current = newActiveKeys;
          setActiveKeyIndices(newActiveKeys);
        }
      }

      animationFrameId.current = requestAnimationFrame(processFrame);
    };

    animationFrameId.current = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [started]);

  if (!started) {
    return (
      <StartScreen 
        onStart={async () => {
          setStarted(true);
          await ensureAudioStarted();
          setAudioReady(true);
        }} 
      />
    );
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Live webcam background (rendered by CameraFeed) */}
      <CameraFeed onResults={handleResults} />

      {/* Piano Keyboard */}
      <PianoKeyboard ref={pianoRef} activeKeyIndices={activeKeyIndices} />

      {/* Hand Skeleton Overlays */}
      <HandSkeleton
        ref={leftSkeletonRef}
        color="#FF6A3D"
        handType="left"
      />

      <HandSkeleton
        ref={rightSkeletonRef}
        color="#3B82F6"
        handType="right"
      />

      {/* Bottom hint */}
      <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center pointer-events-none">
        <p className="px-4 py-2 rounded-full bg-black/50 border border-white/10 text-xs sm:text-sm text-white/70 backdrop-blur-md">
          Tap anywhere to begin
        </p>
      </div>

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />
    </div>
  );
}

export default App;