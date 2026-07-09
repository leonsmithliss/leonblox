import { useEffect, useState } from "react";
import { Link } from "wouter";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

export default function MessageSuccess() {
  const [status, setStatus] = useState<Status>("loading");
  const [type, setType] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }

    fetch(`/api/stripe/verify-payment?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setType(data.type ?? "message");
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-28">
        <div className="max-w-md w-full text-center border border-border bg-card/50 p-10">
          {status === "loading" && (
            <p className="font-mono text-muted-foreground animate-pulse tracking-widest">CONFIRMING PAYMENT...</p>
          )}

          {status === "success" && (
            <>
              <div className="text-5xl mb-6">{type === "sound" ? "🔊" : "💬"}</div>
              <h1 className="font-display font-bold text-3xl tracking-widest text-foreground mb-3">
                {type === "sound" ? "SOUND QUEUED" : "MESSAGE QUEUED"}
              </h1>
              <p className="text-muted-foreground font-mono text-sm mb-8">
                {type === "sound"
                  ? "Your sound effect will play live on stream."
                  : "Your message will be read live on stream."}
              </p>
              <Link href="/message">
                <Button className="rounded-none font-display font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  SEND ANOTHER
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-5xl mb-6">⚠️</div>
              <h1 className="font-display font-bold text-2xl tracking-widest text-foreground mb-3">
                SOMETHING WENT WRONG
              </h1>
              <p className="text-muted-foreground font-mono text-sm mb-8">
                Payment verification failed. If you were charged, contact Leon.
              </p>
              <Link href="/message">
                <Button variant="outline" className="rounded-none font-display font-bold tracking-widest">
                  GO BACK
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
