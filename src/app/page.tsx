'use client';

import MediaControl from "@/components/MediaControl";
import MusicGrid from "@/components/MusicGrid";
import { MusicProvider } from "@/contexts/MusicContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";

function AppContent() {
  useBackgroundSync(); // Sync background with current song

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <main className="flex flex-col items-center container mx-auto pb-24 relative z-10">
        <MusicGrid />
      </main>
      <MediaControl />
    </div>
  );
}

export default function Home() {
  return (
    <BackgroundProvider>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </BackgroundProvider>
  );
}
