'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useMusic } from '@/contexts/MusicContext';
import { Song } from '@/types/music';
import { musicService } from '@/services/MusicService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import NavExpand from './NavMenu';
import '../css/MusicGrid.css';

export default function MusicGrid() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [activeGenre, setActiveGenre] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
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
                setFilteredSongs(shuffledPlaylist);
            } catch (error) {
                console.error('Error loading songs:', error);
            }
        };

        loadSongs();
    }, [loadPlaylist]);

    // Filter and search effect
    useEffect(() => {
        let result = [...songs];

        // Apply genre filter
        if (activeGenre) {
            result = result.filter(song => {
                const genres = song.genre.toLowerCase().split(',').map(g => g.trim());
                if (activeGenre === "Other") {
                    // For "Other", exclude Pop and J-Pop songs
                    return !genres.some(genre => 
                        genre.includes("pop") || 
                        genre.includes("j-pop")
                    );
                } else {
                    // For specific genres, check if any genre contains the search term
                    return genres.some(genre => genre.includes(activeGenre.toLowerCase()));
                }
            });
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            result = result.filter(song => 
                song.title.toLowerCase().includes(search) ||
                song.artist.toLowerCase().includes(search) ||
                song.album.toLowerCase().includes(search) ||
                song.genre.toLowerCase().includes(search) ||
                song.year.toString().includes(search)
            );
        }

        setFilteredSongs(result);
    }, [songs, activeGenre, searchTerm]);

    const handleGenreFilter = (genre: string | null) => {
        setActiveGenre(genre);
    };

    const handleSearch = (search: string) => {
        setSearchTerm(search);
    };

    // Effect to control vinyl animation
    useEffect(() => {
        const currentAnimations = animationRefs.current;
        
        if (playerState.currentSong) {
            const songKey = playerState.currentSong.url;
            
            // Check if current song is in filtered results
            const isCurrentSongVisible = filteredSongs.some(song => song.url === playerState.currentSong?.url);
            
            if (isCurrentSongVisible) {
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
            } else {
                // Current song is not visible, but keep the rotation state
                // Stop animation but don't reset rotation
                if (animationRefs.current[songKey]) {
                    cancelAnimationFrame(animationRefs.current[songKey]!);
                    animationRefs.current[songKey] = null;
                }
            }
        }

        return () => {
            Object.values(currentAnimations).forEach(animId => {
                if (animId) cancelAnimationFrame(animId);
            });
        };
    }, [playerState.isPlaying, playerState.currentSong, filteredSongs]);

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

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="music-grid-container">
                <h1 className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8 w-full">
                    <Image
                        priority={true}
                        src="/logo.png"
                        alt="AuraFlow Logo"
                        width={200}
                        height={60}
                        className="logo w-36 h-auto md:w-48 lg:w-52"
                    />
                    <div className="flex items-center space-x-4 ml-auto">
                        <a href="https://github.com/AnhNangCuaEm/AuraFlow" target="_blank" rel="noopener noreferrer"
                            className="transition-transform duration-300 hover:scale-110 hover:rotate-3">
                            <div className="w-8 h-8 bg-white rounded"></div>
                        </a>
                        <a href="https://anhnangcuaem.com" target="_blank" rel="noopener noreferrer"
                            className="transition-transform duration-300 hover:scale-110 hover:-rotate-3">
                            <Image
                                src="/portfolio.png"
                                alt="Portfolio Logo"
                                width={32}
                                height={32}
                                title='Portfolio'
                                className="portfolio-logo w-8 h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 transition-all duration-300 hover:brightness-110 hover:drop-shadow-lg"
                            />
                        </a>
                    </div>
                </h1>
                <div className="no-results-message">
                    <div className="text-gray-900 text-lg">曲を読み込んでいます...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="music-grid-container">
            <NavExpand 
                onGenreFilter={handleGenreFilter}
                onSearch={handleSearch}
                activeGenre={activeGenre}
            />
            
            <h1 className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8 w-full">
                <Image
                    priority={true}
                    src="/logo.png"
                    alt="AuraFlow Logo"
                    width={200}
                    height={60}
                    className="logo w-36 h-auto md:w-48 lg:w-52"
                />
                {/* github link and portfolio link */}
                <div className="flex items-center space-x-4 ml-auto">
                    <a href="https://github.com/AnhNangCuaEm/AuraFlow" target="_blank" rel="noopener noreferrer"
                        className="transition-transform duration-300 hover:scale-110 hover:rotate-3">
                        {isClient && (
                            <FontAwesomeIcon icon={faGithub} size='2xl' color='white' title='GitHub'
                                className="transition-colors duration-300 hover:text-gray-300" />
                        )}
                    </a>
                    <a href="https://anhnangcuaem.com" target="_blank" rel="noopener noreferrer"
                        className="transition-transform duration-300 hover:scale-110 hover:-rotate-3">
                        <Image
                            src="/portfolio.png"
                            alt="Portfolio Logo"
                            width={32}
                            height={32}
                            title='Portfolio'
                            className="portfolio-logo w-8 h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 transition-all duration-300 hover:brightness-110 hover:drop-shadow-lg"
                        />
                    </a>
                </div>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredSongs.map((song, index) => (
                    <div
                        key={song.url}
                        className={`music-card song-item ${playerState.currentSong?.title === song.title ? 'active' : ''}`}
                        onClick={() => handleSongClick(song, index)}
                    >
                        <div
                            className="vinyl-container"
                        >
                            <div
                                className="vinyl-image"
                                ref={el => { 
                                    vinylRefs.current[song.url] = el;
                                    // Apply saved rotation immediately when element is mounted
                                    if (el && rotationRefs.current[song.url] !== undefined) {
                                        el.style.transform = `rotate(${rotationRefs.current[song.url]}deg)`;
                                    }
                                }}
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
                            <p className="song-genre" title={song.genre}>
                                {song.genre}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSongs.length === 0 && songs.length > 0 && (
                <div className="no-results-message">
                    <div className="text-white text-xl">検索結果が見つかりませんでした</div>
                    <div className="text-gray-400 text-sm mt-2">別のキーワードでもう一度お試しください</div>
                </div>
            )}

            {songs.length === 0 && (
                <div className="no-results-message">
                    <div className="text-gray-900 text-lg">曲を読み込んでいます...</div>
                </div>
            )}
        </div>
    );
}
