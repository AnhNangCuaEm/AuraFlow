'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMusic } from '@/contexts/MusicContext';
import { Song } from '@/types/music';
import { musicService } from '@/services/musicService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import '../css/MusicGrid.css';

export default function MusicGrid() {
    const [songs, setSongs] = useState<Song[]>([]);
    const { playSong, playerState } = useMusic();

    // Hàm shuffle array
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
                const playlist = await musicService.loadPlaylist();
                // Tự động shuffle mỗi lần load trang
                const shuffledPlaylist = shuffleArray(playlist);
                setSongs(shuffledPlaylist);
            } catch (error) {
                console.error('Error loading songs:', error);
            }
        };

        loadSongs();
    }, []);

    const handleSongClick = async (song: Song, index: number) => {
        try {
            await playSong(song, index);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    return (
        <div className="music-grid-container">
            <h1 className="mb-4 md:mb-6 lg:mb-8">
                <Image
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
                        className={`music-card ${playerState.currentSong?.title === song.title ? 'active' : ''
                            }`}
                        onClick={() => handleSongClick(song, index)}
                    >
                        <div className="vinyl-container">
                            <Image
                                src={musicService.getVinylArtUrl(song.cover)}
                                alt={`${song.title} vinyl art`}
                                width={200}
                                height={200}
                                className="vinyl-art"
                                unoptimized
                            />

                            <div className="play-overlay">
                                <div className="play-button">
                                    {playerState.currentSong?.title === song.title && playerState.isPlaying ? (
                                        <FontAwesomeIcon icon={faPause}/>
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
                    <div className="text-gray-500 text-lg">Loading music collection...</div>
                </div>
            )}
        </div>
    );
}
