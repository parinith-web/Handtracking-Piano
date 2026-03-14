import { motion } from 'motion/react';
import InfinitePlane from '@/components/ui/infinite-plane';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden p-4">
      {/* Animated Infinite Plane background */}
      <InfinitePlane className="absolute inset-0 z-0" />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6 w-full">
        {/* Footer Credit (Outside the Card, above it) */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-zinc-200"
        >
          Developed by
          <a 
            href="https://parinithreddymavurapu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 underline hover:text-white transition-colors"
          >
            Parinith Reddy
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px] bg-zinc-900/70 backdrop-blur-xl border border-zinc-700/40 rounded-[24px] p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
        {/* Subtle top glare effect */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Minimal Icon */}
        <div className="w-16 h-16 mb-8 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center shadow-inner">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300" />
            <path d="M8 4v16M16 4v16M12 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300" />
            <path d="M6 4v8M10 4v8M14 4v8M18 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
          </svg>
        </div>

        {/* Text */ }
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-3">
          Piano Learning
        </h1>
        <p className="text-zinc-400 text-[15px] leading-relaxed mb-10 tracking-wide max-w-[280px]">
          Play piano with real-time hand tracking right in your browser.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-white text-black rounded-full px-10 py-3.5 font-medium text-[15px] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95"
        >
          Tap to Start
        </button>
      </motion.div>
      </div>
    </div>
  );
}
