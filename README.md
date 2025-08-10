# 🎵 AuraFlow - Immersive Music Experience

AuraFlow is a modern music streaming application built with [Next.js](https://nextjs.org), delivering a colorful and interactive musical experience.

> **⚠️ Educational Project Disclaimer**  
> This project is developed for educational and learning purposes only. All music files, album artwork, and related content are used under fair use for educational demonstration.

## ✨ Key Features

### 🎨 Dynamic & Interactive Interface
- **Smart Background**: Automatically changes background colors based on album art's dominant colors
- **Vinyl Animation**: Realistic vinyl record spinning effects during playback
- **Material Design**: Modern interface with blur effects and gradients

### 🎧 Complete Music Experience
- **Media Controls**: Full playback controls (play/pause, next/previous, seek, volume)
- **Queue Management**: Manage playback queue with drag & drop reordering
- **Shuffle & Repeat**: Random playback and repeat modes
- **Lyrics Display**: Time-synchronized lyrics display

### 🔍 Music Discovery
- **Music Grid**: Display collection in grid layout with vinyl covers
- **Genre Filtering**: Filter music by genre
- **Search**: Search songs by title
- **Multi-format Support**: Support for multiple audio formats

### 🛠️ Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Audio**: Web Audio API with Media Session API
- **Interactions**: @dnd-kit for drag & drop functionality
- **Icons**: FontAwesome

## 🚀 Installation & Setup

```bash
# Clone repository
git clone [repository-url]
cd AuraFlow

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
public/
├── arts/          # Album artwork
├── vinylarts/     # Vinyl cover designs
├── songs/         # Audio files (.m4a)
├── lyrics/        # Lyric files (.json)
└── detail.json    # Music metadata

src/
├── components/    # React components
├── contexts/      # Context providers
├── hooks/         # Custom hooks
├── services/      # Business logic
└── types/         # TypeScript definitions
```

## ⚖️ Legal Notice

This application is created for **educational and demonstration purposes only**. Please note:

- 🖼️ **Album Artwork**: Any artwork used should be properly licensed or used under fair use guidelines.
- 📚 **Educational Use**: This project serves as a learning tool for web development technologies and should not be used for commercial distribution of copyrighted content.
- 🔒 **User Responsibility**: Users are solely responsible for ensuring they have the necessary rights and licenses for any content they use with this application.

**By using this application, you agree to comply with all applicable copyright laws and regulations.**

---

*Built with ❤️ for learning and exploring modern web technologies*