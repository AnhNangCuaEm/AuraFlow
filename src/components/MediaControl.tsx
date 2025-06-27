'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image'
import { useMusic } from "@/contexts/MusicContext";
import { musicService } from "@/services/MusicService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMusic,
    faBackward,
    faPlay,
    faPause,
    faForward,
    faChevronUp,
    faChevronDown,
    faRepeat,
    faShuffle,
    faVolumeHigh
} from '@fortawesome/free-solid-svg-icons'
import "../css/MediaControl.css";

export default function MediaControl() {
    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'lyrics' | 'nextup'>('lyrics');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const {
        playerState,
        togglePlayPause,
        next,
        previous,
        seekTo,
        setVolume,
        getCurrentLyricLine,
    } = useMusic();

    // Debug audio player state
    useEffect(() => {
    }, [playerState.volume]);

    // Track when song changes from null to a song
    useEffect(() => {
        if (playerState.currentSong && !isTransitioning) {
            setIsTransitioning(true);
            // Reset transition state after animation completes
            setTimeout(() => setIsTransitioning(false), 800);
        }
    }, [playerState.currentSong]);

    // Close volume slider when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.volume-container')) {
                setShowVolumeSlider(false);
            }
        };

        if (showVolumeSlider) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showVolumeSlider]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        seekTo(newTime);
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const toggleLoop = () => {
        setIsLooping(!isLooping);
        // Here you would implement the actual loop functionality
        console.log('Loop toggled:', !isLooping);
    };

    const toggleShuffle = () => {
        setIsShuffling(!isShuffling);
        // Here you would implement the actual shuffle functionality
        console.log('Shuffle toggled:', !isShuffling);
    };

    const toggleVolumeSlider = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowVolumeSlider(!showVolumeSlider);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        
        setVolume(newVolume / 100);
    };

    const currentLyric = getCurrentLyricLine();
    const artUrl = playerState.currentSong
        ? musicService.getArtUrl(playerState.currentSong.art)
        : "/default-art.jpg";

    const nextUpSongs: any[] = [];  // Remove queue for now

    if (!playerState.currentSong) {
        return (
            <div className="media-control empty-state">
                <div className="media-content">
                    <div className="album-art">
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faMusic} className="text-gray-900 text-xl" />
                        </div>
                    </div>
                    <div className="flex-1 text-center text-gray-900">
                        曲を選択してください
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`media-control ${expanded ? "expanded" : ""} ${isTransitioning ? "transitioning" : ""}`}>
            {expanded && (
                <div className="expanded-content">
                    <div className="large-art">
                        <Image
                            priority={false}
                            src={artUrl}
                            alt="Album Art"
                            width={400}
                            height={400}
                            placeholder='blur'
                            blurDataURL={'../../public/blur.png'}
                        />
                    </div>

                    <div className="content-container">
                        <div className="tab-buttons">
                            <button
                                className={`tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('lyrics')}
                            >
                                Lyrics
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'nextup' ? 'active' : ''}`}
                                onClick={() => setActiveTab('nextup')}
                            >
                                Next Up
                            </button>
                        </div>
                        {activeTab === 'lyrics' ? (
                            <div className="lyrics-container">
                                <h3>{playerState.currentSong.title}</h3>
                                <p className="artist-name">{playerState.currentSong.artist}</p>
                                <div className="lyrics-text">
                                    {playerState.lyrics.map((line, index) => (
                                        <p
                                            key={index}
                                            className={currentLyric?.text === line.text ? 'current-lyric' : ''}
                                        >
                                            {line.text}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="next-up-container">
                                <h3>Next Up</h3>
                                <div className="next-up-list">
                                    {nextUpSongs.length > 0 ? (
                                        nextUpSongs.map((song, index) => (
                                            <div key={song.id || index} className="next-up-item">
                                                <div className="next-up-art">
                                                    <Image
                                                        src={musicService.getArtUrl(song.art)}
                                                        alt={song.title}
                                                        width={40}
                                                        height={40}
                                                    />
                                                </div>
                                                <div className="next-up-info">
                                                    <p className="next-up-title">{song.title}</p>
                                                    <p className="next-up-artist">{song.artist}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                                            No songs in queue
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="media-content">
                <div className="album-art">
                    <Image
                        src={artUrl}
                        alt="Album Art"
                        width={64}
                        height={64}
                    />
                </div>

                <div className="timeline-container">
                    <span className="time-display">{formatTime(playerState.currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={playerState.duration}
                        value={playerState.currentTime}
                        onChange={handleSeek}
                        className="timeline"
                    />
                    <span className="time-display">{formatTime(playerState.duration)}</span>
                </div>

                <div className="control-buttons">

                    <button className="control-btn" onClick={previous}>
                        <FontAwesomeIcon icon={faBackward} />
                    </button>

                    <button className="control-btn play-btn" onClick={togglePlayPause}>
                        <FontAwesomeIcon
                            icon={playerState.isPlaying ? faPause : faPlay}
                            size="lg"
                        />
                    </button>

                    <button className="control-btn" onClick={next}>
                        <FontAwesomeIcon icon={faForward} />
                    </button>
                    {/* Loop button - only visible when expanded */}
                    {expanded && (
                        <button
                            className={`control-btn loop-btn ${isLooping ? 'active' : ''}`}
                            onClick={toggleLoop}
                            title="Loop"
                        >
                            <FontAwesomeIcon icon={faRepeat} />
                        </button>
                    )}


                    {/* Shuffle button - only visible when expanded */}
                    {expanded && (
                        <button
                            className={`control-btn shuffle-btn ${isShuffling ? 'active' : ''}`}
                            onClick={toggleShuffle}
                            title="Shuffle"
                        >
                            <FontAwesomeIcon icon={faShuffle} />
                        </button>
                    )}

                    {/* Volume button with slider - only visible when expanded */}
                    {expanded && (
                        <div className={`volume-container ${showVolumeSlider ? 'show-slider' : ''}`}>
                            <button
                                className="control-btn volume-btn"
                                onClick={toggleVolumeSlider}
                                title="Volume"
                            >
                                <FontAwesomeIcon icon={faVolumeHigh} />
                            </button>

                            {showVolumeSlider && (
                                <>
                                    <div className="volume-slider-backdrop"></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={Math.round(playerState.volume * 100)}
                                        onChange={handleVolumeChange}
                                        className="volume-slider"
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button className="expand-btn" onClick={toggleExpanded}>
                    <FontAwesomeIcon
                        icon={expanded ? faChevronDown : faChevronUp}
                    />
                </button>
            </div>
        </div>
    );
}