import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SOUND_MAP: Record<string, string> = {
  "vine-boom": "/vine-boom.mp3",
  "evil-laugh": "/evil-laugh.mp3",
  "taco-bell-bong": "/taco-bell-bong.mp3",
  "omg": "/omg.mp3",
  "bruh": "/bruh.mp3",
  "i-got-this": "/i-got-this.mp3",
  "screaming-chicken": "/screaming-chicken.mp3",
  "hee-hee": "/hee-hee.mp3",
  "fahh": "/fahh.mp3",
};

interface Message {
  id: number;
  msg: string;
  sound: string | null;
  played: boolean;
  status: string;
}

interface Signup {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return (
    new Date(iso).toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " EST"
  );
}

// ─── Stream Reader ────────────────────────────────────────────────
function StreamReader() {
  const [nowReading, setNowReading] = useState("Nothing yet...");
  const [queue, setQueue] = useState<Message[]>([]);
  const [reading, setReading] = useState(false);
  const processingRef = useRef(false);
  const readingRef = useRef(false);

  useEffect(() => {
    readingRef.current = reading;
  }, [reading]);

  async function refreshQueue() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("played", false)
      .eq("status", "approved")
      .order("id", { ascending: true });
    setQueue(data ?? []);
  }

  async function processQueue() {
    if (processingRef.current || !readingRef.current) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("played", false)
      .eq("status", "approved")
      .order("id", { ascending: true });

    if (!data || data.length === 0) return;

    processingRef.current = true;

    for (const m of data) {
      if (!readingRef.current) break;

      setNowReading(m.msg || "(sound only)");
      setQueue((prev) => prev.filter((x) => x.id !== m.id));

      if (m.sound && SOUND_MAP[m.sound]) {
        const audio = new Audio(SOUND_MAP[m.sound]);
        audio.volume = 1;
        await audio.play().catch(() => {});
        await new Promise<void>((res) => {
          audio.onended = () => res();
          setTimeout(res, 5000);
        });
      }

      if (m.msg && readingRef.current) {
        await new Promise<void>((res) => {
          const utt = new SpeechSynthesisUtterance(m.msg);
          utt.onend = () => res();
          utt.onerror = () => res();
          speechSynthesis.speak(utt);
          setTimeout(res, 10000);
        });
      }

      await supabase.from("messages").update({ played: true }).eq("id", m.id);

      if (readingRef.current) {
        await new Promise<void>((res) => setTimeout(res, 7000));
      }
    }

    setNowReading("Nothing yet...");
    processingRef.current = false;
  }

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!reading) {
      speechSynthesis.cancel();
      setNowReading("Nothing yet...");
      return;
    }
    const interval = setInterval(processQueue, 1500);
    return () => clearInterval(interval);
  }, [reading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-mono">
          {reading ? "🟢 Reading messages aloud..." : "⚫ Reading paused — queue is live"}
        </p>
        <button
          onClick={() => setReading((r) => !r)}
          className={`font-display font-bold tracking-widest px-6 py-3 text-sm transition-colors ${
            reading
              ? "bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30"
              : "bg-primary text-black hover:bg-primary/80 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          }`}
        >
          {reading ? "STOP READING" : "START READING"}
        </button>
      </div>

      {reading && (
        <div className="border border-primary/40 bg-primary/5 p-6 text-center shadow-[0_0_20px_rgba(0,255,255,0.1)]">
          <p className="font-display text-xs tracking-widest text-primary/60 mb-3">NOW READING</p>
          <p className="text-2xl md:text-3xl font-bold text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
            {nowReading}
          </p>
        </div>
      )}

      <div className="border border-border bg-card/20">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="font-display text-xs tracking-widest text-muted-foreground">
            APPROVED QUEUE — {queue.length} pending
          </p>
          {queue.length > 0 && !reading && (
            <p className="text-xs font-mono text-primary/60">Hit START READING to play</p>
          )}
        </div>
        {queue.length === 0 ? (
          <p className="px-4 py-6 text-muted-foreground font-mono text-sm text-center">Queue is empty</p>
        ) : (
          <ol className="divide-y divide-border">
            {queue.map((m, i) => (
              <li key={m.id} className="px-4 py-3 flex items-start gap-3">
                <span className="font-display text-xs text-primary/60 mt-1 shrink-0">{i + 1}</span>
                <div>
                  <p className="text-sm text-foreground">{m.msg}</p>
                  {m.sound && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">🔊 {m.sound}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ─── Moderation ───────────────────────────────────────────────────
function Moderation({ secret }: { secret: string }) {
  const [pending, setPending] = useState<Message[]>([]);
  const [acting, setActing] = useState<Record<number, boolean>>({});

  async function fetchPending() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: true });
    setPending(data ?? []);
  }

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 3000);
    return () => clearInterval(interval);
  }, []);

  async function moderate(id: number, action: "approve" | "decline") {
    setActing((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, id, action }),
      });
      setPending((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setActing((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm font-mono">
        {pending.length === 0
          ? "No messages waiting for review."
          : `${pending.length} message${pending.length !== 1 ? "s" : ""} waiting — APPROVE to send to stream, DECLINE to discard.`}
      </p>

      {pending.length === 0 ? (
        <div className="border border-border bg-card/20 py-16 text-center">
          <p className="text-muted-foreground font-mono text-sm">Nothing to review right now.</p>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {pending.map((m) => (
            <div key={m.id} className="px-4 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground break-words">{m.msg}</p>
                {m.sound && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">🔊 {m.sound}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={acting[m.id]}
                  onClick={() => moderate(m.id, "approve")}
                  className="font-display font-bold tracking-widest px-4 py-2 text-xs bg-primary text-black hover:bg-primary/80 transition-colors disabled:opacity-40 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                >
                  APPROVE
                </button>
                <button
                  disabled={acting[m.id]}
                  onClick={() => moderate(m.id, "decline")}
                  className="font-display font-bold tracking-widest px-4 py-2 text-xs bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40"
                >
                  DECLINE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Email List ───────────────────────────────────────────────────
function EmailList({ secret }: { secret: string }) {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/signups?secret=${encodeURIComponent(secret)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSignups(data); })
      .finally(() => setLoading(false));
  }, [secret]);

  function handleDownload() {
    window.open(`/api/admin/export-signups?secret=${encodeURIComponent(secret)}`, "_blank");
  }

  if (loading) return <p className="text-muted-foreground font-mono text-sm text-center py-12">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-muted-foreground text-sm font-mono">{signups.length} subscriber{signups.length !== 1 ? "s" : ""}</p>
        <button
          onClick={handleDownload}
          className="bg-primary text-black font-display font-bold tracking-widest px-6 py-3 text-sm hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)]"
        >
          DOWNLOAD CSV
        </button>
      </div>

      {signups.length === 0 ? (
        <div className="border border-border bg-card/20 py-16 text-center">
          <p className="text-muted-foreground font-mono text-sm">No signups yet.</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_auto] font-display text-xs tracking-widest text-muted-foreground bg-card/40 border-b border-border">
            <div className="px-4 py-3">NAME</div>
            <div className="px-4 py-3">EMAIL</div>
            <div className="px-4 py-3 text-right">SIGNED UP</div>
          </div>
          {signups.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[1fr_2fr_auto] text-sm border-b border-border last:border-0 ${i % 2 === 0 ? "bg-transparent" : "bg-card/10"}`}
            >
              <div className="px-4 py-3 font-medium truncate">{s.name}</div>
              <div className="px-4 py-3 font-mono text-muted-foreground truncate">{s.email}</div>
              <div className="px-4 py-3 font-mono text-muted-foreground text-right text-xs whitespace-nowrap">{formatDate(s.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────
export default function Admin() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"stream" | "moderation" | "emails">("moderation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/signups?secret=${encodeURIComponent(secret)}`);
      if (res.status === 401) {
        setError("Wrong password.");
        setLoading(false);
        return;
      }
      setAuthed(true);
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display font-bold text-3xl tracking-widest text-center mb-8">
            ADMIN <span className="text-primary">ACCESS</span>
          </h1>
          <form onSubmit={handleLogin} className="border border-border bg-card/30 p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-display text-xs tracking-widest text-muted-foreground">PASSWORD</label>
              <input
                type="password"
                required
                autoFocus
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter admin password"
                className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-black font-display font-bold tracking-widest py-3 text-sm hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? "CHECKING..." : "ENTER"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "moderation" as const, label: "MODERATION" },
    { key: "stream" as const, label: "STREAM READER" },
    { key: "emails" as const, label: "EMAIL LIST" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground px-6 py-12">
      <div className="max-w-4xl mx-auto">

        <h1 className="font-display font-bold text-3xl tracking-widest mb-8">
          LEON<span className="text-primary">BLOX</span> ADMIN
        </h1>

        <div className="flex border-b border-border mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-display text-sm tracking-widest px-6 py-3 transition-colors ${
                tab === t.key
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "moderation" && <Moderation secret={secret} />}
        {tab === "stream" && <StreamReader />}
        {tab === "emails" && <EmailList secret={secret} />}

      </div>
    </div>
  );
}
