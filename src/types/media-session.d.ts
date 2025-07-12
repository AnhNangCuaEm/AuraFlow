// Media Session API type definitions
interface MediaMetadataInit {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: MediaImage[];
}

interface MediaImage {
    src: string;
    sizes?: string;
    type?: string;
}

interface MediaPositionState {
    duration?: number;
    playbackRate?: number;
    position?: number;
}

interface MediaSessionActionDetails {
    action: MediaSessionAction;
    seekOffset?: number;
    seekTime?: number;
    fastSeek?: boolean;
}

type MediaSessionAction = 
    | 'play'
    | 'pause'
    | 'seekbackward'
    | 'seekforward'
    | 'previoustrack'
    | 'nexttrack'
    | 'skipad'
    | 'seekto'
    | 'stop';

type MediaSessionPlaybackState = 'none' | 'paused' | 'playing';

interface MediaSession {
    metadata: MediaMetadata | null;
    playbackState: MediaSessionPlaybackState;
    setActionHandler(action: MediaSessionAction, handler: ((details: MediaSessionActionDetails) => void) | null): void;
    setPositionState?(state?: MediaPositionState): void;
}

interface MediaMetadata {
    title: string;
    artist: string;
    album: string;
    artwork: ReadonlyArray<MediaImage>;
}

declare const MediaMetadata: {
    prototype: MediaMetadata;
    new(init?: MediaMetadataInit): MediaMetadata;
};

interface Navigator {
    readonly mediaSession?: MediaSession;
}
