import { useState } from "react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

const PRESETS = [5, 10, 25, 50];

export default function Donate() {
  const [selected, setSelected] = useState<number | null>(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amount = custom ? parseFloat(custom) : selected;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount < 1) {
      setError("Please enter an amount of at least $1.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden">
      <SiteNav />

      <div className="max-w-2xl mx-auto px-6 pt-40 pb-24">
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-widest mb-6">
          DONA<span className="text-primary">TE</span>
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          Support LeonBlox and help keep the content coming. Every donation means the world!
        </p>

        <form onSubmit={handleDonate} className="border border-border bg-card/20 p-8 flex flex-col gap-8">
          {/* Preset amounts */}
          <div className="flex flex-col gap-3">
            <label className="font-display text-xs tracking-widest text-muted-foreground">SELECT AMOUNT</label>
            <div className="grid grid-cols-4 gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setSelected(p); setCustom(""); }}
                  className={`py-4 font-display font-bold tracking-widest text-sm transition-colors border ${
                    selected === p && !custom
                      ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                      : "bg-transparent border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="flex flex-col gap-2">
            <label className="font-display text-xs tracking-widest text-muted-foreground">OR ENTER CUSTOM AMOUNT</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                placeholder="0"
                className="w-full bg-background border border-border pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-400 font-mono text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !amount}
            className="bg-primary text-black font-display font-bold tracking-widest py-4 text-sm hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:opacity-50"
          >
            {loading ? "REDIRECTING..." : amount ? `DONATE $${amount}` : "DONATE"}
          </button>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}
