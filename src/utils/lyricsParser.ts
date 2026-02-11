import { LyricLine } from '@/types/music';

/**
 * Parse LRC format lyrics to LyricLine array
 * LRC format: [mm:ss.xx]lyrics text
 * Example: [00:15.40]Things fall apart
 */
export function parseLRCFormat(lrcLines: string[]): LyricLine[] {
    const lyrics: LyricLine[] = [];
    
    // LRC format regex: [minutes:seconds.centiseconds]
    const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;
    
    for (const line of lrcLines) {
        const match = line.match(lrcRegex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const centiseconds = parseInt(match[3], 10);
            const text = match[4].trim();
            
            // Convert to milliseconds
            const timeInMs = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
            
            if (text) { // Only add lines with text
                lyrics.push({
                    time: timeInMs,
                    text: text
                });
            }
        }
    }
    
    return lyrics;
}

/**
 * Detect and parse lyrics based on format
 * Supports both LRC format (string array) and JSON object format
 */
export function parseLyrics(data: unknown): LyricLine[] {
    // Check if it's already in LyricLine format (array of objects with time and text)
    if (Array.isArray(data) && data.length > 0) {
        // Check first element
        const firstItem = data[0];
        
        // If it's already LyricLine format
        if (typeof firstItem === 'object' && 'time' in firstItem && 'text' in firstItem) {
            return data as LyricLine[];
        }
        
        // If it's LRC format (array of strings)
        if (typeof firstItem === 'string') {
            return parseLRCFormat(data);
        }
    }
    
    return [];
}

/**
 * Convert LyricLine array back to LRC format string array
 * Useful for exporting or displaying in LRC format
 */
export function toLRCFormat(lyrics: LyricLine[]): string[] {
    return lyrics.map(line => {
        const totalSeconds = Math.floor(line.time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((line.time % 1000) / 10);
        
        const mm = minutes.toString().padStart(2, '0');
        const ss = seconds.toString().padStart(2, '0');
        const cs = centiseconds.toString().padStart(2, '0');
        
        return `[${mm}:${ss}.${cs}]${line.text}`;
    });
}
