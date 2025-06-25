import { Song, LyricLine } from '@/types/music';

export class MusicService {
    private static instance: MusicService;
    private songs: Song[] = [];

    private constructor() { }

    public static getInstance(): MusicService {
        if (!MusicService.instance) {
            MusicService.instance = new MusicService();
        }
        return MusicService.instance;
    }

    public async loadSongs(): Promise<Song[]> {
        try {
            const response = await fetch('/detail.json');
            this.songs = await response.json();
            return this.songs;
        } catch (error) {
            console.error('Error loading songs:', error);
            return [];
        }
    }

    public getSongs(): Song[] {
        return this.songs;
    }

    public getSongByIndex(index: number): Song | null {
        return this.songs[index] || null;
    }

    public searchSongs(query: string): Song[] {
        const lowercaseQuery = query.toLowerCase();
        return this.songs.filter(
            song =>
                song.title.toLowerCase().includes(lowercaseQuery) ||
                song.artist.toLowerCase().includes(lowercaseQuery) ||
                song.album.toLowerCase().includes(lowercaseQuery) ||
                song.genre.toLowerCase().includes(lowercaseQuery)
        );
    }

    public getSongsByGenre(genre: string): Song[] {
        return this.songs.filter(song =>
            song.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }

    public async loadLyrics(lyricPath: string): Promise<LyricLine[]> {
        try {
            const response = await fetch(`/${lyricPath}`);
            const lyrics = await response.json();
            return lyrics;
        } catch (error) {
            console.error('Error loading lyrics:', error);
            return [];
        }
    }

    public getArtUrl(artPath: string): string {
        return `/${artPath}`;
    }

    public getAudioUrl(audioPath: string): string {
        return `/${audioPath}`;
    }

    public async loadPlaylist(): Promise<Song[]> {
        return await this.loadSongs();
    }

    public getVinylArtUrl(vinylPath: string): string {
        return `/${vinylPath}`;
    }
}

export const musicService = MusicService.getInstance();