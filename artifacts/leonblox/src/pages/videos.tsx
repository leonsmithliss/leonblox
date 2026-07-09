import { useState, useEffect, useRef } from "react";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

interface YtVideo {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

interface CategorizedContent {
  shorts: YtVideo[];
  livestreams: YtVideo[];
  longform: YtVideo[];
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K views`;
  return `${n} views`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function VideoCard({ video, rank }: { video: YtVideo; rank?: number }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group border border-border bg-card/50 hover:border-primary/60 transition-colors"
    >
      <div className="relative aspect-video overflow-hidden">
        {rank === 1 && (
          <div className="absolute top-2 left-2 z-10 bg-primary px-2 py-0.5 font-display font-bold text-xs tracking-widest text-primary-foreground">
            #1 MOST VIEWED
          </div>
        )}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-sm tracking-wide text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span className="text-primary font-bold">{formatViews(video.viewCount)}</span>
          <span>{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border bg-card/50 animate-pulse">
          <div className="aspect-video bg-border" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-border rounded w-3/4" />
            <div className="h-3 bg-border rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
        {label} <span className="text-primary">{accent}</span>
      </h2>
      <div className="mt-3 h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
    </div>
  );
}

export default function Videos() {
  const [latest, setLatest] = useState<YtVideo[]>([]);
  const [data, setData] = useState<CategorizedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latestRef = useRef<HTMLElement>(null);
  const shortsRef = useRef<HTMLElement>(null);
  const livestreamsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/youtube-videos").then((r) => r.json()),
      fetch("/api/youtube-content").then((r) => r.json()),
    ])
      .then(([latestData, contentData]) => {
        if (Array.isArray(latestData)) {
        const sorted = [...latestData].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        setLatest(sorted);
      }
        if (contentData.shorts || contentData.livestreams) setData(contentData);
        else setError("Could not load videos.");
      })
      .catch(() => setError("Could not load videos."))
      .finally(() => setLoading(false));
  }, []);

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              TOP <span className="text-primary">CONTENT</span>
            </h1>
          </div>

          {/* Filter boxes */}
          <div className="grid grid-cols-3 gap-3 mb-20">
            <button
              onClick={() => scrollTo(latestRef)}
              className="group border border-border bg-card/50 hover:border-primary hover:bg-primary/10 transition-all p-4 md:p-8 text-center"
            >
              <div className="text-2xl md:text-4xl mb-2">🚀</div>
              <div className="font-display font-bold text-xs md:text-2xl tracking-widest text-foreground group-hover:text-primary transition-colors">
                LATEST 25 UPLOADS
              </div>
            </button>
            <button
              onClick={() => scrollTo(shortsRef)}
              className="group border border-border bg-card/50 hover:border-primary hover:bg-primary/10 transition-all p-4 md:p-8 text-center"
            >
              <div className="text-2xl md:text-4xl mb-2">🎬</div>
              <div className="font-display font-bold text-xs md:text-2xl tracking-widest text-foreground group-hover:text-primary transition-colors">
                TOP 25 SHORTS
              </div>
            </button>
            <button
              onClick={() => scrollTo(livestreamsRef)}
              className="group border border-border bg-card/50 hover:border-primary hover:bg-primary/10 transition-all p-4 md:p-8 text-center"
            >
              <div className="text-2xl md:text-4xl mb-2">📡</div>
              <div className="font-display font-bold text-xs md:text-2xl tracking-widest text-foreground group-hover:text-primary transition-colors">
                TOP 25 LIVESTREAMS
              </div>
            </button>
          </div>

          {error && <p className="text-center text-red-400 font-mono mb-8">{error}</p>}

          {/* LATEST 25 */}
          <section ref={latestRef} className="mb-20 scroll-mt-28">
            <SectionHeading label="LATEST 25" accent="UPLOADS" />
            {loading ? <SkeletonGrid /> : (
              latest.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latest.slice(0, 25).map((v) => <VideoCard key={v.id} video={v} />)}
                </div>
              ) : (
                <p className="text-muted-foreground font-mono text-sm">No videos found.</p>
              )
            )}
          </section>

          {/* TOP 25 SHORTS */}
          <section ref={shortsRef} className="mb-20 scroll-mt-28">
            <SectionHeading label="TOP 25" accent="SHORTS" />
            {loading ? <SkeletonGrid /> : (
              data?.shorts.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.shorts.slice(0, 25).map((v, i) => <VideoCard key={v.id} video={v} rank={i + 1} />)}
                </div>
              ) : (
                <p className="text-muted-foreground font-mono text-sm">No shorts found.</p>
              )
            )}
          </section>

          {/* TOP 25 LIVESTREAMS */}
          <section ref={livestreamsRef} className="mb-20 scroll-mt-28">
            <SectionHeading label="TOP 25" accent="LIVESTREAMS" />
            {loading ? <SkeletonGrid count={3} /> : (
              data?.livestreams.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.livestreams.slice(0, 25).map((v, i) => <VideoCard key={v.id} video={v} rank={i + 1} />)}
                </div>
              ) : (
                <p className="text-muted-foreground font-mono text-sm">No live streams found.</p>
              )
            )}
          </section>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
