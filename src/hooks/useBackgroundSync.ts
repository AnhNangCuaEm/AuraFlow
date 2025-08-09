'use client';

import { useEffect } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { musicService } from '@/services/MusicService';

export const useBackgroundSync = () => {
  const { playerState } = useMusic();
  const { updateColors, resetToDefault } = useBackground();

  useEffect(() => {
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
  }, [playerState.currentSong, updateColors, resetToDefault]);
};
