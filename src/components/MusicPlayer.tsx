import { ChangeEvent, createContext, useContext, useEffect, useRef, useState, ReactNode, RefObject } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon } from 'lucide-react';
import { Track } from '../types';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber_Grit.wav',
    artist: 'AI_Generator_v2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/neon1/200/200'
  },
  {
    id: '2',
    title: 'Neon_Sunset.mp3',
    artist: 'Dream_Machine',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/neon2/200/200'
  },
  {
    id: '3',
    title: 'Data_Stream_04.flac',
    artist: 'Bit_Crusher_AI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/neon3/200/200'
  }
];

interface MusicContextType {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  volume: number;
  currentTrackIndex: number;
  togglePlay: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  setTrackIndex: (index: number) => void;
  handleProgressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Playback blocked', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };
  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };
  const setTrackIndex = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
      setProgress(val);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, progress, volume, currentTrackIndex,
      togglePlay, handleNext, handlePrev, setTrackIndex,
      handleProgressChange, handleVolumeChange, audioRef
    }}>
      <audio ref={audioRef} src={currentTrack.url} />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}

export function SidebarPlaylist() {
  const { currentTrackIndex, setTrackIndex } = useMusic();
  
  return (
    <aside className="w-[320px] bg-card-bg border-r border-border-subtle p-[30px] flex flex-col h-full overflow-y-auto">
      <h3 className="text-[12px] uppercase tracking-[2px] text-color-text-dim mb-5">Playlist</h3>
      <div className="space-y-[10px]">
        {DUMMY_TRACKS.map((track, i) => (
          <button
            key={track.id}
            onClick={() => setTrackIndex(i)}
            className={`w-full group p-[15px] rounded-lg bg-white/[0.03] cursor-pointer flex items-center border border-transparent transition-all ${
              i === currentTrackIndex ? '!border-neon-pink bg-neon-pink/[0.05]' : 'hover:bg-white/[0.05]'
            }`}
          >
            <span className={`font-mono text-[11px] mr-[15px] ${i === currentTrackIndex ? 'text-neon-pink' : 'text-color-text-dim'}`}>
              0{i + 1}
            </span>
            <div className="text-left overflow-hidden">
              <h4 className="text-[14px] text-white font-medium truncate">{track.title}</h4>
              <p className="text-[12px] text-color-text-dim truncate">{track.artist}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export function FooterPlayer() {
  const { currentTrack, isPlaying, progress, volume, togglePlay, handleNext, handlePrev, handleProgressChange, handleVolumeChange, audioRef } = useMusic();

  return (
    <footer className="h-[100px] bg-card-bg border-t border-border-subtle flex items-center px-10 justify-between">
      <div className="flex items-center gap-5 w-[300px]">
        <div className="w-[60px] h-[60px] bg-gradient-to-br from-neon-pink to-neon-cyan rounded flex items-center justify-center shrink-0">
          <img src={currentTrack.cover} alt="" className="w-full h-full object-cover rounded opacity-80" />
        </div>
        <div className="overflow-hidden">
          <div className="text-[14px] font-bold text-white truncate">{currentTrack.title}</div>
          <div className="text-[12px] text-color-text-dim truncate">{currentTrack.artist}</div>
        </div>
      </div>

      <div className="flex items-center gap-[25px]">
        <button onClick={handlePrev} className="text-white hover:text-neon-cyan transition-colors">
          <SkipBack size={20} />
        </button>
        <button
          onClick={togglePlay}
          className="w-[50px] h-[50px] rounded-full bg-white text-bg-deep flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
        </button>
        <button onClick={handleNext} className="text-white hover:text-neon-cyan transition-colors">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex-grow max-w-[400px] mx-10">
        <div className="flex justify-between text-[10px] mb-2 text-color-text-dim font-mono tracking-wider">
          <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
          <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
        </div>
        <div className="relative group h-1 bg-white/[0.1] rounded-full overflow-hidden">
           <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="h-full bg-neon-cyan shadow-[0_0_10px_var(--color-neon-cyan)] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-[15px]">
        <Volume2 size={16} className="text-color-text-dim" />
        <div className="w-[100px] h-1 bg-white/[0.1] rounded-full relative group">
           <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="h-full bg-color-text-dim rounded-full"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </footer>
  );
}

function formatTime(time: number) {
  if (isNaN(time)) return '0:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
