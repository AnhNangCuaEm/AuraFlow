'use client';

import { useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useBackground } from '@/contexts/BackgroundContext';
import { musicService } from '@/services/MusicService';

export const useBackgroundSync = () => {
  const { playerState } = useMusic();
  const { updateColors, resetToDefault } = useBackground();
  const lastSongUrl = useRef<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentSongUrl = playerState.currentSong?.url || null;
    
    // Clear previous timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Only update if song actually changed
    if (lastSongUrl.current !== currentSongUrl) {
      lastSongUrl.current = currentSongUrl;
      
      // Debounce color extraction for performance
      updateTimeoutRef.current = setTimeout(() => {
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
      }, 300); // 300ms debounce
    }
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [playerState.currentSong, updateColors, resetToDefault]); // Include all dependencies
};
