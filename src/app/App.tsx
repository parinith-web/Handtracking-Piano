import { PianoKeyboard } from './components/PianoKeyboard';
import { HandSkeleton } from './components/HandSkeleton';
import { motion } from 'motion/react';
import CameraFeed from './components/CameraFeed';

function App() {
  function handleResults(results: any) {
    if (!results.multiHandLandmarks) return;

    results.multiHandLandmarks.forEach((landmarks: any) => {
      const indexFinger = landmarks[8];

      const x = indexFinger.x * window.innerWidth;
      const y = indexFinger.y * window.innerHeight;

      console.log("Finger position:", x, y);
    });
  }
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Webcam background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1737222866593-57a42c5ac347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW0lMjB2aWV3JTIwbXVzaWNpYW4lMjBoYW5kcyUyMHBpYW5vfGVufDF8fHx8MTc3MzQ3NDg3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Webcam view"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(8px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 106, 61, 0.15), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Piano Keyboard */}
      <PianoKeyboard />

      {/* Hand Skeleton Overlays */}
      <HandSkeleton
        color="#FF6A3D"
        handType="left"
        position={{ x: 350, y: 450 }}
        activeFingers={[8, 12]}
      />

      <HandSkeleton
        color="#3B82F6"
        handType="right"
        position={{ x: 1150, y: 420 }}
        activeFingers={[4, 8]}
      />

      {/* Floating stats/info - optional decorative element */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
                style={{ boxShadow: '0 0 10px #3B82F6' }} />
              <span className="text-white/80 text-sm">Right Hand</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"
                style={{ boxShadow: '0 0 10px #FF6A3D' }} />
              <span className="text-white/80 text-sm">Left Hand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />
      <CameraFeed onResults={handleResults} />
    </div>
  );
}

export default App;