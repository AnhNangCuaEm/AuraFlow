'use client';

import React, { useState } from "react";
import Image from 'next/image'
import { useMusic } from "@/contexts/MusicContext";
import { musicService } from "@/services/musicService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faMusic, 
    faBackward, 
    faPlay, 
    faPause, 
    faForward, 
    faChevronUp,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import "../css/mediacontrol.css";

export default function MediaControl() {
    const [expanded, setExpanded] = useState(false);
    const {
        playerState,
        togglePlayPause,
        next,
        previous,
        seekTo,
        getCurrentLyricLine
    } = useMusic();

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

    const currentLyric = getCurrentLyricLine();
    const artUrl = playerState.currentSong
        ? musicService.getArtUrl(playerState.currentSong.art)
        : "/default-art.jpg";

    if (!playerState.currentSong) {
        return (
            <div className="media-control">
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
        <div className={`media-control ${expanded ? "expanded" : ""}`}>
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
                </div>

                <button className="expand-btn" onClick={toggleExpanded}>
                    <FontAwesomeIcon 
                        icon={expanded ? faChevronDown : faChevronUp} 
                    />
                </button>
            </div>

            {expanded && (
                <div className="expanded-content">
                    <div className="large-art">
                        <Image
                            src={artUrl}
                            alt="Album Art"
                            width={300}
                            height={300}
                        />
                    </div>
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
                </div>
            )}
        </div>
    );
}