import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import { MusicProvider, SidebarPlaylist, FooterPlayer } from './components/MusicPlayer';
import { GameState } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [, setScore] = useState(0);

  return (
    <MusicProvider>
      <div className="h-screen w-screen bg-bg-deep flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[60px] px-10 flex items-center justify-between border-b border-white/[0.1] bg-card-bg/80 backdrop-blur-[10px] z-20">
          <div className="text-[18px] font-black uppercase tracking-[4px] text-neon-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            NEON // PULSE
          </div>
          <div className="text-[11px] text-color-text-dim uppercase tracking-widest">
            System: Operational
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-grow flex h-[calc(100vh-60px-100px)] overflow-hidden">
          {/* Sidebar */}
          <SidebarPlaylist />

          {/* Game Stage */}
          <main className="flex-grow relative overflow-hidden">
            <SnakeGame 
              onScoreChange={setScore} 
              gameState={gameState} 
              setGameState={setGameState} 
            />
          </main>
        </div>

        {/* Player Bar */}
        <FooterPlayer />
      </div>
    </MusicProvider>
  );
}
