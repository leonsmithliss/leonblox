import { useState } from "react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
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

  const pct = ((amount - 5) / (10000 - 5)) * 100;

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

        <form onSubmit={handleDonate} className="border border-border bg-card/20 p-8 flex flex-col gap-10">
          {/* Amount display */}
          <div className="text-center">
            <span className="font-display font-bold text-6xl md:text-8xl text-primary drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
              ${amount}
            </span>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-4">
            <input
              type="range"
              min={5}
              max={10000}
              step={5}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(0,255,255) 0%, rgb(0,255,255) ${pct}%, rgb(30,30,30) ${pct}%, rgb(30,30,30) 100%)`,
              }}
            />
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>$5</span>
              <span>$10,000</span>
            </div>
          </div>

          {error && <p className="text-red-400 font-mono text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-black font-display font-bold tracking-widest py-4 text-sm hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:opacity-50"
          >
            {loading ? "REDIRECTING..." : `DONATE $${amount}`}
          </button>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}
