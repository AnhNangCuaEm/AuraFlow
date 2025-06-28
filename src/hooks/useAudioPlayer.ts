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
        lyrics: [],
        isLoading: false,
        showVolumeSlider: false,
    });

    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setPlayerState(prev => ({
                ...prev,
                currentTime: audio.currentTime,
            }));
        };

        const handleDurationChange = () => {
            setPlayerState(prev => ({
                ...prev,
                duration: audio.duration || 0,
            }));
        };

        const handleEnded = () => {
            next();
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
    }, []);

    const loadPlaylist = useCallback(async () => {
        const songs = await musicService.loadSongs();
        setPlayerState(prev => ({
            ...prev,
            playlist: songs,
        }));
        return songs;
    }, []);

    const playSong = useCallback(async (song: Song, index: number) => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const audioUrl = musicService.getAudioUrl(song.url);

        setPlayerState(prev => ({
            ...prev,
            currentSong: song,
            currentIndex: index,
            isLoading: true,
        }));

        const lyrics = await musicService.loadLyrics(song.lyric);

        audio.src = audioUrl;
        audio.load();

        setPlayerState(prev => ({
            ...prev,
            lyrics,
        }));

        try {
            await audio.play();
            setPlayerState(prev => ({
                ...prev,
                isPlaying: true,
            }));
        } catch (error) {
            console.error('Error playing audio:', error);
            setPlayerState(prev => ({
                ...prev,
                isPlaying: false,
                isLoading: false,
            }));
        }
    }, []);

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

    const next = useCallback(() => {
        const { playlist, currentIndex } = playerState;
        if (playlist.length === 0) return;

        const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
        playSong(playlist[nextIndex], nextIndex);
    }, [playerState.playlist, playerState.currentIndex, playSong]);

    const previous = useCallback(() => {
        const { playlist, currentIndex } = playerState;
        if (playlist.length === 0) return;

        const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        playSong(playlist[prevIndex], prevIndex);
    }, [playerState.playlist, playerState.currentIndex, playSong]);

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

    // Thêm các functions mới cho volume
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
    }, [playerState.lyrics, playerState.currentTime]);

    return {
        playerState,
        loadPlaylist,
        playSong,
        togglePlayPause,
        next,
        previous,
        seekTo,
        setVolume,
        volumeUp,
        volumeDown,
        toggleVolumeSlider,
        hideVolumeSlider,
        getCurrentLyricLine,
    };
};