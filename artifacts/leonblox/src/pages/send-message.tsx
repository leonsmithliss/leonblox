import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

const TIERS = [
  { label: "FAN", emoji: "🔥", limit: 50, price: "$2", key: "fan" },
  { label: "VIP", emoji: "💎", limit: 100, price: "$5", key: "vip" },
  { label: "LEGEND", emoji: "👑", limit: 500, price: "$20", key: "legend" },
];

const SOUNDS = [
  { label: "VINE BOOM", key: "vine-boom" },
  { label: "EVIL LAUGH", key: "evil-laugh" },
  { label: "TACO BELL BONG", key: "taco-bell-bong" },
  { label: "OH MY GOD", key: "omg" },
  { label: "BRUH", key: "bruh" },
  { label: "I GOT THIS", key: "i-got-this" },
  { label: "SCREAMING CHICKEN", key: "screaming-chicken" },
  { label: "HEE HEE", key: "hee-hee" },
  { label: "FAHH", key: "fahh" },
];

function previewAudio(key: string) {
  const audio = new Audio(`/${key}.mp3`);
  audio.volume = 1;
  audio.play().catch(() => {});
}

async function createCheckout(body: object): Promise<string | null> {
  const r = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return data.url ?? null;
}

function MessageBox() {
  const [activeTier, setActiveTier] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const tier = TIERS[activeTier];
  const remaining = tier.limit - message.length;
  const overLimit = remaining < 0;

  function switchTier(index: number) {
    setActiveTier(index);
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSend() {
    if (!name.trim()) { setErrorMsg("Please enter your name."); setStatus("error"); return; }
    if (!message.trim()) { setErrorMsg("Please type a message."); setStatus("error"); return; }
    if (overLimit) { setErrorMsg(`Message exceeds ${tier.limit} character limit.`); setStatus("error"); return; }

    setStatus("sending");
    try {
      const url = await createCheckout({
        type: "message",
        tierKey: tier.key,
        name: name.trim(),
        message: message.trim(),
        successPath: "/message/success",
      });
      if (url) {
        window.location.href = url;
      } else {
        setErrorMsg("Could not create checkout. Try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  return (
    <div className="border border-border bg-card/50 backdrop-blur-sm">
      <div className="grid grid-cols-3">
        {TIERS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => switchTier(i)}
            className={`relative flex items-stretch transition-colors
              ${activeTier === i ? "bg-primary/10" : "hover:bg-white/5"}
              ${i < TIERS.length - 1 ? "border-r border-border" : ""}
              border-b border-border`}
          >
            <div className="inline-flex flex-col items-center gap-0 py-5 px-4 w-full">
              <span className={`font-display font-bold text-2xl tracking-widest leading-none ${activeTier === i ? "text-primary" : "text-muted-foreground"}`}>
                {t.emoji} {t.label}
              </span>
              <div className={`w-full h-px my-2 ${activeTier === i ? "bg-primary/40" : "bg-border"}`} />
              <span className={`font-display font-bold text-xl tracking-tight leading-none ${activeTier === i ? "text-primary/70" : "text-muted-foreground/50"}`}>
                {t.price}
              </span>
            </div>
            {activeTier === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-4">
        <div>
          <label className="block font-display text-xs tracking-widest text-primary mb-2">YOUR NAME</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
            placeholder="Your Name"
            className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-display text-xs tracking-widest text-primary">MESSAGE</label>
            <span className={`font-mono text-xs tabular-nums ${overLimit ? "text-red-400 font-bold" : remaining <= 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
              {remaining} left
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); setStatus("idle"); }}
            placeholder="Type your message..."
            rows={5}
            maxLength={tier.limit}
            className={`w-full bg-background border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors font-mono text-sm resize-none ${overLimit ? "border-red-400" : "border-border focus:border-primary"}`}
          />
        </div>

        {status === "error" && (
          <p className="text-red-400 text-xs font-mono">{errorMsg}</p>
        )}

        <Button
          onClick={handleSend}
          disabled={status === "sending" || overLimit}
          className="w-full rounded-none font-display font-bold tracking-widest h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          {status === "sending" ? "REDIRECTING TO PAYMENT..." : `SEND MESSAGE — ${tier.price}`}
        </Button>
        <p className="text-muted-foreground text-xs font-mono text-center">
          You'll be taken to Stripe to pay securely. Message is queued after payment.
        </p>
      </div>
    </div>
  );
}

function SoundEffects() {
  const [sendStatus, setSendStatus] = useState<Record<string, "idle" | "sending">>({});

  async function handleSend(key: string) {
    setSendStatus((s) => ({ ...s, [key]: "sending" }));
    try {
      const url = await createCheckout({
        type: "sound",
        soundKey: key,
        successPath: "/message/success",
      });
      if (url) {
        window.location.href = url;
      } else {
        setSendStatus((s) => ({ ...s, [key]: "idle" }));
      }
    } catch {
      setSendStatus((s) => ({ ...s, [key]: "idle" }));
    }
  }

  return (
    <div className="border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-3">
          SEND A <span className="text-primary">SOUND</span>
        </h2>
        <p className="text-muted-foreground">
          Sounds play live on stream. <span className="text-[#ff00ff] font-mono font-bold">$1 each</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SOUNDS.map((sound) => {
          const st = sendStatus[sound.key] ?? "idle";
          return (
            <div key={sound.key} className="flex border border-[#ff00ff]">
              <button
                onClick={() => previewAudio(sound.key)}
                title="Preview"
                className="px-3 border-r border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/20 transition-colors text-sm font-bold shrink-0"
              >
                ▶
              </button>
              <button
                onClick={() => handleSend(sound.key)}
                disabled={st === "sending"}
                className="flex-1 py-3 font-display font-bold tracking-widest text-sm text-[#ff00ff] hover:bg-[#ff00ff] hover:text-white transition-all disabled:opacity-50"
              >
                {st === "sending" ? "..." : sound.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SendMessage() {
  const [liveStatus, setLiveStatus] = useState<{ isLive: boolean; title?: string } | null>(null);

  useEffect(() => {
    fetch("/api/youtube-live-status")
      .then((r) => r.json())
      .then(setLiveStatus)
      .catch(() => setLiveStatus({ isLive: false }));
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              SEND A <span className="text-primary">MESSAGE</span>
            </h1>
            <p className="text-muted-foreground">Messages get read live on stream.</p>
          </div>

          {/* Quick nav boxes */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => document.getElementById("message-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="group border border-border bg-card/50 hover:border-primary hover:bg-primary/10 transition-all p-4 md:p-6 text-center"
            >
              <div className="text-2xl md:text-3xl mb-2">💬</div>
              <div className="font-display font-bold text-sm md:text-lg tracking-widest text-foreground group-hover:text-primary transition-colors">SEND A MESSAGE</div>
            </button>
            <button
              onClick={() => document.getElementById("sound-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="group border border-border bg-card/50 hover:border-primary hover:bg-primary/10 transition-all p-4 md:p-6 text-center"
            >
              <div className="text-2xl md:text-3xl mb-2">🔊</div>
              <div className="font-display font-bold text-sm md:text-lg tracking-widest text-foreground group-hover:text-primary transition-colors">SEND A SOUND</div>
            </button>
          </div>

          {/* Live status indicator */}
          {liveStatus === null ? (
            <div className="flex items-center justify-center gap-2 border border-border bg-card/50 px-4 py-3 font-display text-sm tracking-widest text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
              CHECKING LIVE STATUS...
            </div>
          ) : liveStatus.isLive ? (
            <div className="flex items-center justify-center gap-3 border border-green-500 bg-green-500/10 px-4 py-3 font-display text-sm tracking-widest text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              🔴 LEONBLOX IS LIVE NOW — YOUR MESSAGE WILL BE READ
              {liveStatus.title && <span className="text-green-300/70 normal-case font-mono text-xs hidden sm:inline">— {liveStatus.title}</span>}
            </div>
          ) : (
            <div className="flex flex-col gap-2 border border-yellow-500/60 bg-yellow-500/10 px-4 py-4 font-display text-sm tracking-widest text-yellow-400">
              <div className="flex items-center justify-center gap-3">
                ⚠️ LEONBLOX IS NOT LIVE RIGHT NOW
              </div>
              <p className="text-yellow-300/70 text-xs font-mono normal-case text-center leading-relaxed">
                Messages and sounds are only read during a live stream. If you send one while offline, it will not be read and <span className="text-yellow-300 font-bold">refunds cannot be issued</span>. Please wait until Leon is live before sending.
              </p>
            </div>
          )}

          <div id="message-section" className="scroll-mt-28">
            <MessageBox />
          </div>

          <div id="sound-section" className="scroll-mt-28 flex flex-col gap-4">
            {liveStatus !== null && !liveStatus.isLive && (
              <div className="flex flex-col gap-2 border border-yellow-500/60 bg-yellow-500/10 px-4 py-4 font-display text-sm tracking-widest text-yellow-400">
                <div className="flex items-center justify-center gap-3">
                  ⚠️ LEONBLOX IS NOT LIVE RIGHT NOW
                </div>
                <p className="text-yellow-300/70 text-xs font-mono normal-case text-center leading-relaxed">
                  Messages and sounds are only read during a live stream. If you send one while offline, it will not be read and <span className="text-yellow-300 font-bold">refunds cannot be issued</span>. Please wait until Leon is live before sending.
                </p>
              </div>
            )}
            {liveStatus?.isLive && (
              <div className="flex items-center justify-center gap-3 border border-green-500 bg-green-500/10 px-4 py-3 font-display text-sm tracking-widest text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                🔴 LEONBLOX IS LIVE NOW — YOUR SOUND WILL PLAY
              </div>
            )}
            <SoundEffects />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
