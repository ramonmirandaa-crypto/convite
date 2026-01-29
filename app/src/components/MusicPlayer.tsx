import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  enabled: boolean;
}

export default function MusicPlayer({ enabled }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          setIsPlaying(false);
        }
      };
      playAudio();
      return () => {
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }
  }, [enabled]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!enabled) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="fixed bottom-6 right-6 z-50">
      <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        {showTooltip && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg text-sm text-gray-700 whitespace-nowrap">
            {isPlaying ? 'Pausar música' : 'Tocar música'}
          </motion.div>
        )}
        <button onClick={togglePlay} className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${isPlaying ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A9A6] text-white animate-pulse-glow' : 'bg-white text-[#D4AF37] hover:shadow-xl'}`}>
          {isPlaying ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Music className="w-6 h-6" />
            </motion.div>
          ) : (
            <Music className="w-6 h-6" />
          )}
        </button>
        {isPlaying && (
          <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} onClick={toggleMute} className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#D4AF37] transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
