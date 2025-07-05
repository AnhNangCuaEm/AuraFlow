'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useMusic } from '@/contexts/MusicContext';
import { Song } from '@/types/music';
import { musicService } from '@/services/MusicService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import '../css/MusicGrid.css';

export default function MusicGrid() {
    const [songs, setSongs] = useState<Song[]>([]);
    const { playSong, togglePlayPause, playerState, loadPlaylist } = useMusic();
    const vinylRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rotationRefs = useRef<{ [key: string]: number }>({});
    const animationRefs = useRef<{ [key: string]: number | null }>({});

    // Shuffle function to randomize song order
    const shuffleArray = (array: Song[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const loadSongs = async () => {
            try {
                // Load playlist into context first
                const playlist = await loadPlaylist();
                const shuffledPlaylist = shuffleArray(playlist);
                setSongs(shuffledPlaylist);
            } catch (error) {
                console.error('Error loading songs:', error);
            }
        };

        loadSongs();
    }, [loadPlaylist]);

    // Effect to control vinyl animation
    useEffect(() => {
        if (playerState.currentSong) {
            const songKey = playerState.currentSong.title;
            const vinylElement = vinylRefs.current[songKey];
            
            if (vinylElement) {
                if (playerState.isPlaying) {
                    //Start animation from last position
                    const startRotation = rotationRefs.current[songKey] || 0;
                    const startTime = Date.now();
                    
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const rotation = startRotation + (elapsed / 10000) * 360;
                        
                        rotationRefs.current[songKey] = rotation % 360;
                        vinylElement.style.transform = `rotate(${rotation}deg)`;
                        
                        animationRefs.current[songKey] = requestAnimationFrame(animate);
                    };
                    
                    animationRefs.current[songKey] = requestAnimationFrame(animate);
                } else {
                    // Stop animation and keep the last rotation
                    if (animationRefs.current[songKey]) {
                        cancelAnimationFrame(animationRefs.current[songKey]!);
                        animationRefs.current[songKey] = null;
                    }
                }
            }
        }

        
        return () => {
            Object.values(animationRefs.current).forEach(animId => {
                if (animId) cancelAnimationFrame(animId);
            });
        };
    }, [playerState.isPlaying, playerState.currentSong]);

    const handleSongClick = async (song: Song, index: number) => {
        try {
            // If the clicked song is currently playing, toggle pause
            if (playerState.currentSong?.title === song.title && playerState.isPlaying) {
                await togglePlayPause();
            } else {
                // Find the actual index in the context playlist (not shuffled)
                const actualIndex = playerState.playlist.findIndex(s => s.url === song.url);
                
                // Always create new queue when playing from main page (vinyl click)
                await playSong(song, actualIndex >= 0 ? actualIndex : index, true);
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    return (
        <div className="music-grid-container">
            <h1 className="mb-4 md:mb-6 lg:mb-8">
                <Image
                    priority={true}
                    src="/logo.png"
                    alt="Music Machine Logo"
                    width={200}
                    height={60}
                    className="logo w-36 h-auto md:w-48 lg:w-52"
                />
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {songs.map((song, index) => (
                    <div
                        key={index}
                        className={`music-card ${playerState.currentSong?.title === song.title ? 'active' : ''}`}
                        onClick={() => handleSongClick(song, index)}
                    >
                        <div 
                            className="vinyl-container"
                        >
                            <div 
                                className="vinyl-image"
                                ref={el => { vinylRefs.current[song.title] = el; }}
                            >
                                <Image
                                    priority={false}
                                    src={musicService.getVinylArtUrl(song.cover)}
                                    alt={`${song.title} vinyl art`}
                                    width={200}
                                    height={200}
                                    className="vinyl-art"
                                    placeholder='blur'
                                    blurDataURL={'../../public/blur.png'}
                                />
                            </div>

                            <div className="play-overlay">
                                <div className="play-button">
                                    {playerState.currentSong?.title === song.title && playerState.isPlaying ? (
                                        <FontAwesomeIcon icon={faPause} />
                                    ) : (
                                        <FontAwesomeIcon icon={faPlay} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="song-info">
                            <h3 className="song-title" title={song.title}>
                                {song.title}
                            </h3>
                            <p className="song-artist" title={song.artist}>
                                {song.artist}
                            </p>
                            <p className="song-album" title={song.album}>
                                {song.album} • {song.year}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {songs.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-900 text-lg">Loading music collection...</div>
                </div>
            )}
        </div>
    );
}
