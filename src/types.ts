export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

export type Point = { x: number; y: number };

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}
