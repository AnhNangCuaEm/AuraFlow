import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Song } from '@/types/music';
import { musicService } from '@/services/MusicService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faXmark } from '@fortawesome/free-solid-svg-icons';

interface QueueItemProps {
    song: Song;
    index: number;
    onRemove: (index: number) => void;
    isCurrentSong?: boolean;
}

export default function QueueItem({ song, index, onRemove, isCurrentSong = false }: QueueItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `queue-item-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`queue-item ${isDragging ? 'dragging' : ''} ${isCurrentSong ? 'current-song' : ''}`}
        >
            <div className="queue-item-content">
                <div className="queue-art">
                    <Image
                        src={musicService.getArtUrl(song.art)}
                        alt={song.title}
                        width={48}
                        height={48}
                    />
                </div>
                
                <div className="queue-info">
                    <p className="queue-title">{song.title}</p>
                    <p className="queue-artist">{song.artist}</p>
                </div>

                <div className="queue-duration">
                    {/* Placeholder duration - you might want to add actual duration to song data */}
                    <span>3:45</span>
                </div>

                <button
                    className="queue-remove-btn"
                    onClick={() => onRemove(index)}
                    title="Remove from queue"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div
                    className="queue-drag-handle"
                    {...attributes}
                    {...listeners}
                    title="Drag to reorder"
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </div>
            </div>
        </div>
    );
}
