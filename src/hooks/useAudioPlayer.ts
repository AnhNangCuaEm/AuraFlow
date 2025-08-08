'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Song, LyricLine, PlayerState } from '@/types/music';
import { musicService } from '@/services/MusicService';

export const useAudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState>({
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        currentIndex: -1,
        playlist: [],
        queue: [],
        originalPlaylist: [],
        lyrics: [],
        isLoading: false,
        showVolumeSlider: false,
        isLooping: false,
        isShuffling: false,
    });

    const loadPlaylist = useCallback(async () => {
        const songs = await musicService.loadSongs();
        // Shuffle songs array for initial random playlist
        const shuffledSongs = [...songs];
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        setPlayerState(prev => ({
            ...prev,
            playlist: shuffledSongs,
            queue: shuffledSongs, // Initialize queue with all songs
        }));
        return shuffledSongs;
    }, []);

    // Update Media Session metadata
    const updateMediaSession = useCallback((song: Song) => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.album,
                artwork: [
                    {
                        src: musicService.getArtUrl(song.art),
                        sizes: '512x512',
                        type: 'image/jpeg'
                    }
                ]
            });
        }
    }, []);

    const playSong = useCallback(async (song: Song, index: number, shouldCreateQueue: boolean = true) => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const audioUrl = musicService.getAudioUrl(song.url);

        // If there's already a song playing, pause and reset it first
        if (audio.src) {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
        }

        // Update state and queue first
        setPlayerState(prev => {
            let newQueue = prev.queue;
            
            if (shouldCreateQueue) {
                // When playing from vinyl art, reorder queue to put selected song at top
                const queueWithoutSong = prev.playlist.filter(s => s.url !== song.url);
                newQueue = [song, ...queueWithoutSong];
            }
            
            return {
                ...prev,
                currentSong: song,
                currentIndex: index,
                queue: newQueue,
                isLoading: true,
                isPlaying: false, // Set to false while loading
            };
        });

        // Load lyrics in parallel with audio loading
        const lyricsPromise = musicService.loadLyrics(song.lyric);

        // Set up new audio source
        audio.src = audioUrl;
        
        // Create a promise that resolves when the audio is ready to play
        const canPlayPromise = new Promise((resolve) => {
            const canPlayHandler = () => {
                audio.removeEventListener('canplay', canPlayHandler);
                resolve(true);
            };
            audio.addEventListener('canplay', canPlayHandler);
        });

        // Load the audio
        audio.load();

        try {
            // Wait for both lyrics and audio to be ready
            const [lyrics] = await Promise.all([lyricsPromise, canPlayPromise]);

            // Update lyrics in state
            setPlayerState(prev => ({
                ...prev,
                lyrics,
            }));

            // Now that everything is ready, play the audio
            try {
                await audio.play();
                // Update final state
                setPlayerState(prev => ({
                    ...prev,
                    isPlaying: true,
                    isLoading: false,
                }));
            } catch (playError) {
                // If autoplay fails (e.g., due to browser restrictions), 
                // still update the state but don't mark as playing
                console.warn('Autoplay was prevented:', playError);
                setPlayerState(prev => ({
                    ...prev,
                    isPlaying: false,
                    isLoading: false,
                }));
            }

            // Update Media Session metadata for the new song
            updateMediaSession(song);
        } catch (error) {
            console.error('Error playing audio:', error);
            setPlayerState(prev => ({
                ...prev,
                isPlaying: false,
                isLoading: false,
            }));
        }
    }, [updateMediaSession]);

    const next = useCallback(() => {
        setPlayerState(prev => {
            const { queue, currentSong } = prev;
            
            if (queue.length > 0 && currentSong) {
                // Find current song index in queue
                const currentQueueIndex = queue.findIndex(song => song.url === currentSong.url);
                
                // Get next song (or wrap around to first song)
                const nextQueueIndex = (currentQueueIndex + 1) % queue.length;
                const nextSong = queue[nextQueueIndex];
                const nextIndex = prev.playlist.findIndex(song => song.url === nextSong.url);
                
                // Use setTimeout instead of requestAnimationFrame for better reliability
                setTimeout(() => {
                    playSong(nextSong, nextIndex, false); // Don't create new queue
                }, 0);
            }
            
            return prev;
        });
    }, [playSong]);

    const previous = useCallback(() => {
        setPlayerState(prev => {
            const { queue, currentSong } = prev;
            
            if (queue.length > 0 && currentSong) {
                // Find current song index in queue
                const currentQueueIndex = queue.findIndex(song => song.url === currentSong.url);
                
                // Get previous song (or wrap around to last song)
                const prevQueueIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1;
                const prevSong = queue[prevQueueIndex];
                const prevIndex = prev.playlist.findIndex(song => song.url === prevSong.url);
                
                // Use setTimeout instead of requestAnimationFrame for better reliability
                setTimeout(() => {
                    playSong(prevSong, prevIndex, false); // Don't create new queue
                }, 0);
            }
            
            return prev;
        });
    }, [playSong]);

    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setPlayerState(prev => {
                const currentTime = audio.currentTime;
                const duration = audio.duration;
                
                // Backup check: if we're very close to the end and playing, 
                // prepare for next song (helpful when tab is not focused)
                if (duration > 0 && currentTime > 0 && (duration - currentTime) < 0.5 && !audio.paused) {
                    // If we're within 0.5 seconds of the end, the 'ended' event should fire soon
                    // This is just a backup mechanism
                }
                
                return {
                    ...prev,
                    currentTime: currentTime,
                };
            });
        };

        const handleDurationChange = () => {
            setPlayerState(prev => ({
                ...prev,
                duration: audio.duration || 0,
            }));
        };

        const handleEnded = () => {
            setPlayerState(prev => {
                // Check if looping is enabled
                if (prev.isLooping) {
                    // Restart the current song
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play();
                    }
                } else {
                    // Trigger next song - use setTimeout instead of requestAnimationFrame
                    // to ensure it works even when tab is not focused
                    setTimeout(() => {
                        next();
                    }, 100); // Small delay to ensure state is updated
                }
                return prev;
            });
        };

        const handleLoadStart = () => {
            setPlayerState(prev => ({ ...prev, isLoading: true }));
        };

        const handleCanPlay = () => {
            setPlayerState(prev => ({ ...prev, isLoading: false }));
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.pause();
        };
    }, [next]);

    // Handle page visibility changes to ensure audio continues playing when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && audioRef.current && playerState.isPlaying) {
                // When tab becomes visible again, ensure audio is still playing
                const audio = audioRef.current;
                if (audio.paused && playerState.isPlaying) {
                    audio.play().catch(error => {
                        console.error('Error resuming audio after visibility change:', error);
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [playerState.isPlaying]);

    const togglePlayPause = useCallback(async () => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        if (playerState.isPlaying) {
            audio.pause();
            setPlayerState(prev => ({ ...prev, isPlaying: false }));
        } else {
            try {
                await audio.play();
                setPlayerState(prev => ({ ...prev, isPlaying: true }));
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
    }, [playerState.isPlaying]);

    const seekTo = useCallback((time: number) => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = time;
        setPlayerState(prev => ({
            ...prev,
            currentTime: time,
        }));
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (!audioRef.current) return;

        const clampedVolume = Math.max(0, Math.min(1, volume));
        audioRef.current.volume = clampedVolume;
        setPlayerState(prev => ({
            ...prev,
            volume: clampedVolume,
        }));
    }, []);

    const volumeUp = useCallback(() => {
        setVolume(Math.min(1, playerState.volume + 0.1));
    }, [playerState.volume, setVolume]);

    const volumeDown = useCallback(() => {
        setVolume(Math.max(0, playerState.volume - 0.1));
    }, [playerState.volume, setVolume]);

    const toggleVolumeSlider = useCallback(() => {
        setPlayerState(prev => ({
            ...prev,
            showVolumeSlider: !prev.showVolumeSlider,
        }));
    }, []);

    const hideVolumeSlider = useCallback(() => {
        setPlayerState(prev => ({
            ...prev,
            showVolumeSlider: false,
        }));
    }, []);

    const setLoop = useCallback((isLoop: boolean) => {
        if (!audioRef.current) return;
        
        audioRef.current.loop = isLoop;
        setPlayerState(prev => ({
            ...prev,
            isLooping: isLoop,
        }));
    }, []);

    const setShuffle = useCallback((isShuffling: boolean) => {
        setPlayerState(prev => {
            let newQueue = [...prev.queue];
            let newOriginalPlaylist = prev.originalPlaylist;
            
            if (isShuffling) {
                // Save original playlist if not already saved
                if (newOriginalPlaylist.length === 0) {
                    newOriginalPlaylist = [...prev.playlist];
                }
                // Shuffle the current queue
                for (let i = newQueue.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
                }
            } else {
                // Restore original order if available
                if (newOriginalPlaylist.length > 0 && prev.currentSong) {
                    // Restore the original queue order (all songs except current)
                    newQueue = newOriginalPlaylist.filter(song => song.url !== prev.currentSong!.url);
                }
            }
            
            return {
                ...prev,
                isShuffling,
                queue: newQueue,
                originalPlaylist: newOriginalPlaylist,
            };
        });
    }, []);

    const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
        setPlayerState(prev => {
            const newQueue = [...prev.queue];
            const [movedItem] = newQueue.splice(startIndex, 1);
            newQueue.splice(endIndex, 0, movedItem);
            
            return {
                ...prev,
                queue: newQueue,
            };
        });
    }, []);

    const removeFromQueue = useCallback((index: number) => {
        setPlayerState(prev => {
            const newQueue = [...prev.queue];
            newQueue.splice(index, 1);
            
            return {
                ...prev,
                queue: newQueue,
            };
        });
    }, []);

    const getCurrentLyricLine = useCallback((): LyricLine | null => {
        const { lyrics, currentTime } = playerState;
        if (lyrics.length === 0) return null;

        // Convert current time to milliseconds for comparison
        const currentTimeMs = currentTime * 1000;

        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (currentTimeMs >= lyrics[i].time) {
                return lyrics[i];
            }
        }
        return null;
    }, [playerState]);

    // Set up Media Session action handlers
    const setupMediaSessionHandlers = useCallback(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                togglePlayPause();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                togglePlayPause();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                previous();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                next();
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime) {
                    seekTo(details.seekTime);
                }
            });

            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                seekTo(Math.max(0, playerState.currentTime - skipTime));
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                seekTo(Math.min(playerState.duration, playerState.currentTime + skipTime));
            });
        }
    }, [togglePlayPause, previous, next, seekTo, playerState.currentTime, playerState.duration]);

    // Update Media Session playback state
    const updateMediaSessionPlaybackState = useCallback((isPlaying: boolean) => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, []);

    // Update Media Session position state
    const updateMediaSessionPositionState = useCallback(() => {
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            if (navigator.mediaSession && typeof navigator.mediaSession.setPositionState === 'function') {
                navigator.mediaSession.setPositionState({
                    duration: playerState.duration,
                    playbackRate: 1.0,
                    position: playerState.currentTime
                });
            }
        }
    }, [playerState.duration, playerState.currentTime]);

    // Initialize Media Session handlers
    useEffect(() => {
        setupMediaSessionHandlers();
    }, [setupMediaSessionHandlers]);

    // Update Media Session when song changes
    useEffect(() => {
        if (playerState.currentSong) {
            updateMediaSession(playerState.currentSong);
        }
    }, [playerState.currentSong, updateMediaSession]);

    // Update Media Session playback state when playing state changes
    useEffect(() => {
        updateMediaSessionPlaybackState(playerState.isPlaying);
    }, [playerState.isPlaying, updateMediaSessionPlaybackState]);

    // Update Media Session position state periodically
    useEffect(() => {
        if (playerState.isPlaying && playerState.duration > 0) {
            const interval = setInterval(() => {
                updateMediaSessionPositionState();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [playerState.isPlaying, playerState.duration, updateMediaSessionPositionState]);

    return {
        playerState,
        loadPlaylist,
        playSong,
        togglePlayPause,
        next,
        previous,
        seekTo,
        setVolume,
        setLoop,
        setShuffle,
        reorderQueue,
        removeFromQueue,
        volumeUp,
        volumeDown,
        toggleVolumeSlider,
        hideVolumeSlider,
        getCurrentLyricLine,
    };
};
