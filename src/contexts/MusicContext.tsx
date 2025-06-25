'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { PlayerState, Song, LyricLine } from '@/types/music';

interface MusicContextType {
    playerState: PlayerState;
    loadPlaylist: () => Promise<Song[]>;
    playSong: (song: Song, index: number) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    
    next: () => void;
    previous: () => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    getCurrentLyricLine: () => LyricLine | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioPlayer = useAudioPlayer();

    return (
        <MusicContext.Provider value={audioPlayer}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};