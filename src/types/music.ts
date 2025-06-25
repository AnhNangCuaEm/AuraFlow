export interface Song {
    title: string;
    artist: string;
    album: string;
    year: number;
    genre: string;
    art: string;
    cover: string;
    url: string;
    lyric: string;
}

export interface LyricLine {
    time: number;
    text: string;
}

export interface PlayerState {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    currentIndex: number;
    playlist: Song[];
    lyrics: LyricLine[];
    isLoading: boolean;
}