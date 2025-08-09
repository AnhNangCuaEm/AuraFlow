'use client';

import { useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { musicService } from '@/services/MusicService';

export const useBackgroundSync = () => {
  const { playerState } = useMusic();
  const { updateColors, resetToDefault } = useBackground();
  const lastSongUrl = useRef<string | null>(null);

  useEffect(() => {
    const currentSongUrl = playerState.currentSong?.url || null;
    
    // Only update if song actually changed
    if (lastSongUrl.current !== currentSongUrl) {
      lastSongUrl.current = currentSongUrl;
      
      if (playerState.currentSong) {
        // Get the full image URL for color extraction
        const artUrl = musicService.getArtUrl(playerState.currentSong.art);
        
        // Update background colors based on album art
        updateColors(artUrl).catch((error) => {
          console.error('Failed to update background colors:', error);
        });
      } else {
        // Reset to default when no song is playing
        resetToDefault();
      }
    }
  }, [playerState.currentSong, updateColors, resetToDefault]); // Include all dependencies
};
