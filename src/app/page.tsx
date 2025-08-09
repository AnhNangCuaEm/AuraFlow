'use client';

import { useEffect, useRef } from 'react';
import NavExpand from "@/components/NavMenu";
import MediaControl from "@/components/MediaControl";
import MusicGrid from "@/components/MusicGrid";
import { MusicProvider } from "@/contexts/MusicContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";

function AppContent() {
  useBackgroundSync(); // Sync background with current song
  
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const curX = useRef(0);
  const curY = useRef(0);
  const tgX = useRef(0);
  const tgY = useRef(0);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const interBubble = interBubbleRef.current;
    if (!interBubble) return;

    const move = () => {
      curX.current += (tgX.current - curX.current) / 20;
      curY.current += (tgY.current - curY.current) / 20;
      interBubble.style.transform = `translate(${Math.round(curX.current)}px, ${Math.round(curY.current)}px)`;
      animationId.current = requestAnimationFrame(move);
    };

    const handleMouseMove = (event: MouseEvent) => {
      tgX.current = event.clientX;
      tgY.current = event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    move();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <>
      <div className="gradient-bg">
        <svg>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div ref={interBubbleRef} className="interactive"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen p-4 relative overflow-hidden">
        <main className="flex flex-col items-center container mx-auto pb-24 relative z-10">
          <NavExpand />
          <MusicGrid />
        </main>
        <MediaControl />
      </div>
    </>
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
