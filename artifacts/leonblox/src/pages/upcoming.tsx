import { useState, useEffect } from "react";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

interface UpcomingStream {
  id: string;
  title: string;
  thumbnail: string;
  scheduledAt: string;
  url: string;
}

function formatScheduled(iso: string): string {
  if (!iso) return "TBA";
  const date = new Date(iso);
  const formatted = date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatted} EST`;
}

function getCountdownParts(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, mins, secs };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="bg-card border border-primary/40 shadow-[0_0_20px_rgba(0,255,255,0.25)] px-4 md:px-6 py-3 md:py-4 min-w-[72px] md:min-w-[100px] text-center">
          <span className="font-display font-bold text-4xl md:text-7xl text-primary drop-shadow-[0_0_12px_rgba(0,255,255,0.8)] tabular-nums leading-none">
            {display}
          </span>
        </div>
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      </div>
      <span className="font-display text-xs md:text-sm tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

function CountdownDisplay({ scheduledAt }: { scheduledAt: string }) {
  const [parts, setParts] = useState(() => getCountdownParts(scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts(scheduledAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  if (!parts) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="font-display font-bold text-3xl text-green-400 tracking-widest animate-pulse drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]">
          🔴 STARTING SOON
        </span>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-8">
      <p className="font-display text-xs tracking-widest text-primary/60 text-center mb-4 uppercase">Live In</p>
      <div className="flex items-start justify-center gap-3 md:gap-5">
        {parts.days > 0 && <CountdownUnit value={parts.days} label="DAYS" />}
        <CountdownUnit value={parts.hours} label="HOURS" />
        <div className="font-display text-3xl md:text-6xl font-bold text-primary/40 mt-2 md:mt-3 leading-none select-none">:</div>
        <CountdownUnit value={parts.mins} label="MINS" />
        <div className="font-display text-3xl md:text-6xl font-bold text-primary/40 mt-2 md:mt-3 leading-none select-none">:</div>
        <CountdownUnit value={parts.secs} label="SECS" />
      </div>
    </div>
  );
}

export default function Upcoming() {
  const [streams, setStreams] = useState<UpcomingStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/youtube-upcoming")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStreams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              UPCOMING <span className="text-primary">STREAMS</span>
            </h1>
          </div>

          {loading ? (
            <div className="grid gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border bg-card/30 p-6 animate-pulse space-y-4">
                  <div className="w-full h-52 bg-muted rounded" />
                  <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
                  <div className="flex justify-center gap-4">
                    {[1,2,3,4].map((j) => <div key={j} className="w-20 h-20 bg-muted rounded" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-24 border border-border bg-card/20">
              <div className="text-6xl mb-4">📡</div>
              <h2 className="font-display font-bold text-2xl tracking-widest text-foreground mb-3">NO STREAMS SCHEDULED</h2>
              <p className="text-muted-foreground text-sm">Check back soon — Leon goes live regularly.</p>
              <a
                href="https://www.youtube.com/@LeonBloxOfficial/streams"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 font-display text-sm tracking-widest text-primary hover:underline"
              >
                VIEW YOUTUBE LIVE TAB →
              </a>
            </div>
          ) : (
            <div className="grid gap-8">
              {streams.map((stream) => (
                <div key={stream.id} className="border border-border bg-card/30 overflow-hidden">
                  {/* Info + Countdown — above thumbnail */}
                  <div className="p-6 md:p-8">
                    <a href={stream.url} target="_blank" rel="noopener noreferrer">
                      <h2 className="font-display font-bold text-xl md:text-3xl text-foreground hover:text-primary transition-colors text-center mb-1">
                        {stream.title}
                      </h2>
                    </a>
                    <p className="text-muted-foreground text-sm font-mono text-center mb-2">
                      {formatScheduled(stream.scheduledAt)}
                    </p>

                    {/* Big countdown */}
                    <div className="border-t border-border/50 mt-4">
                      <CountdownDisplay scheduledAt={stream.scheduledAt} />
                    </div>

                    <div className="text-center mt-2">
                      <a
                        href={stream.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-display text-xs tracking-widest text-primary hover:underline"
                      >
                        SET REMINDER ON YOUTUBE →
                      </a>
                    </div>
                  </div>

                  {/* Thumbnail — below countdown */}
                  <a href={stream.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border-t border-border">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-52 md:h-72 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="https://www.youtube.com/@LeonBloxOfficial/streams"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-sm tracking-widest text-primary hover:underline"
            >
              VIEW ALL ON YOUTUBE →
            </a>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
