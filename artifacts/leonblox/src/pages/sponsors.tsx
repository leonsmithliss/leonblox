import { useState } from "react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function Sponsors() {
  const [company, setCompany] = useState("");
  const [about, setAbout] = useState("");
  const [proposal, setProposal] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Sponsorship Inquiry from ${company}`);
    const body = encodeURIComponent(
      `Company Name: ${company}\n\nAbout: ${about}\n\nProposal: ${proposal}`
    );
    window.location.href = `mailto:leonbloxofficial@gmail.com?subject=${subject}&body=${body}`;
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

          <button
            type="submit"
            className="bg-primary text-black font-display font-bold tracking-widest py-4 text-sm hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]"
          >
            SEND
          </button>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}
