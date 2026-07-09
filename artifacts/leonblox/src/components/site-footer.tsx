import { useState } from "react";
import { Youtube, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

function NewsletterSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <p className="font-display font-bold text-primary tracking-widest">YOU'RE IN! 🎮</p>
        <p className="text-muted-foreground text-sm mt-1 font-mono">Thanks for signing up.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="flex-1 bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-primary text-black font-display font-bold tracking-widest px-6 py-3 text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(0,255,255,0.3)]"
      >
        {status === "loading" ? "..." : "SIGN UP"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs font-mono w-full text-center mt-1">{errorMsg}</p>
      )}
    </form>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-8">STAY CONNECTED</h2>
        <p className="mb-10 font-display tracking-widest text-sm text-primary">
          JOIN <span className="text-foreground">MY</span> DISCORD &mdash; SUBSCRIBE <span className="text-foreground">ON</span> YOUTUBE &mdash; FOLLOW <span className="text-foreground">ON</span> INSTAGRAM
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <a href="https://discord.gg/pP32EHWq77" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-widest w-44">DISCORD</Button>
          </a>
          <a href="https://www.youtube.com/@LeonBloxOfficial" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-widest w-44"><Youtube className="mr-2 w-4 h-4"/> YOUTUBE</Button>
          </a>
          <a href="https://www.instagram.com/leonbloxofficial/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-widest w-44"><Instagram className="mr-2 w-4 h-4"/> INSTAGRAM</Button>
          </a>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-12 mb-12">
          <h3 className="font-display font-bold text-xl md:text-2xl tracking-widest text-foreground mb-2">
            NEWSLETTER <span className="text-primary">SIGN UP</span>
          </h3>
          <p className="text-muted-foreground text-sm font-mono mb-6">
            Stay up to date on new merch drops, upcoming streams &amp; exclusive updates.
          </p>
          <NewsletterSignup />
        </div>

        <div className="text-sm font-mono text-muted-foreground/50">
          &copy; {new Date().getFullYear()} LEONBLOX. ALL SYSTEMS OPERATIONAL.
        </div>
      </div>
    </footer>
  );
}
