import { useState } from "react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function Sponsors() {
  const [company, setCompany] = useState("");
  const [about, setAbout] = useState("");
  const [proposal, setProposal] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/sponsor-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, about, proposal }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setCompany("");
      setAbout("");
      setProposal("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden">
      <SiteNav />

      <div className="max-w-3xl mx-auto px-6 pt-40 pb-24">
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-widest mb-6">
          SPON<span className="text-primary">SORS</span>
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          If you are interested in discussing sponsorship opportunities, please reach out using the form below.
        </p>

        {status === "sent" ? (
          <div className="border border-primary bg-primary/5 p-10 text-center">
            <p className="font-display text-2xl font-bold tracking-widest text-primary mb-2">MESSAGE SENT</p>
            <p className="text-muted-foreground font-mono text-sm">We'll be in touch soon.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="border border-border bg-card/20 p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-display text-xs tracking-widest text-muted-foreground">
                COMPANY NAME
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
                className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display text-xs tracking-widest text-muted-foreground">
                ABOUT YOURSELF
              </label>
              <textarea
                required
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us a bit about yourself or your company..."
                className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display text-xs tracking-widest text-muted-foreground">
                WHAT YOU PROPOSE
              </label>
              <textarea
                required
                rows={5}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Describe your sponsorship proposal..."
                className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 font-mono text-sm">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-primary text-black font-display font-bold tracking-widest py-4 text-sm hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] disabled:opacity-50"
            >
              {status === "sending" ? "SENDING..." : "SEND"}
            </button>
          </form>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
