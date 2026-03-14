import { Music } from 'lucide-react';

interface MusicGuidePanelProps {
  songTitle: string;
  composer: string;
  thumbnail: string;
}

export function MusicGuidePanel({ songTitle, composer, thumbnail }: MusicGuidePanelProps) {
  return (
    <div className="fixed top-8 left-8 z-50">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl w-72">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img 
              src={thumbnail} 
              alt={songTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">Guide</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1 truncate">{songTitle}</h3>
            <p className="text-white/60 text-sm truncate">{composer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
