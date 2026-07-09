import { useState } from "react";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

export default function SignUp() {
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
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-16">
        <div className="w-full max-w-lg">

          {status === "success" ? (
            <div className="text-center border border-primary bg-primary/5 p-12 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
              <div className="text-5xl mb-6">🎮</div>
              <h2 className="font-display font-bold text-3xl text-primary tracking-widest mb-3">YOU'RE IN</h2>
              <p className="text-muted-foreground">Thanks for signing up, {name.trim()}. You'll be the first to know about streams, merch drops, and everything LeonBlox.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
                  SIGN <span className="text-primary">UP</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Stay up to date on the latest happenings — new merch drops, upcoming streams, announcements, and exclusive updates from LeonBlox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="border border-border bg-card/30 p-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-display text-xs tracking-widest text-muted-foreground">NAME</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-display text-xs tracking-widest text-muted-foreground">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-sm font-mono">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 bg-primary text-black font-display font-bold tracking-widest py-4 text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
                >
                  {status === "loading" ? "SIGNING UP..." : "SIGN ME UP"}
                </button>

              </form>
            </>
          )}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
