import NavExpand from "@/components/NavMenu";
import MediaControl from "@/components/MediaControl";
import MusicGrid from "@/components/MusicGrid";
import { MusicProvider } from "@/contexts/MusicContext";

export default function Home() {
  return (
    <MusicProvider>
      <div className=" min-h-screen p-4 bg-gradient-to-br from-violet-50 to-indigo-100">
        <main className="flex flex-col items-center container mx-auto pb-24">
          <NavExpand />
          <MusicGrid />
        </main>
        <MediaControl />
      </div>
    </MusicProvider>
  );
}
