import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SendMessage from "@/pages/send-message";
import MessageSuccess from "@/pages/message-success";
import Videos from "@/pages/videos";
import Upcoming from "@/pages/upcoming";
import SignUp from "@/pages/signup";
import Admin from "@/pages/admin";
import Merch from "@/pages/merch";
import Sponsors from "@/pages/sponsors";
import Donate from "@/pages/donate";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`;
  return n.toString();
}


const queryClient = new QueryClient();

function Section({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`py-24 px-6 md:px-12 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </motion.section>
  );
}

interface YtVideo {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

function Home() {
  const [ytStats, setYtStats] = useState<{ subscribers: string; views: string; likes: string; comments: string } | null>(null);
  useEffect(() => {
    fetch("/api/youtube-stats")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: { subscribers: number; views: number; likes: number; comments: number }) => {
        setYtStats({
          subscribers: formatStat(data.subscribers),
          views: formatStat(data.views),
          likes: data.likes > 0 ? formatStat(data.likes) : "43.7K+",
          comments: data.comments > 0 ? formatStat(data.comments) : "1.8K",
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
          <img src="/images/leonbloxbeach.png" alt="LeonBlox character" className="w-full h-full object-cover object-right opacity-60" />
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
          
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-none mb-6 text-foreground drop-shadow-lg">
              LEONBLOX<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"></span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Epic Roblox Content, Live Streams, and More!
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/videos">
                <Button size="lg" className="rounded-none font-display font-bold tracking-widest text-lg px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                  WATCH LATEST
                </Button>
              </Link>
              <a href="https://www.youtube.com/@LeonBloxOfficial?sub_confirmation=1" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="rounded-none font-display font-bold tracking-widest text-lg px-8 h-14 border-muted-foreground/30 hover:bg-white/5">
                  <Play className="mr-2 w-5 h-5" /> SUBSCRIBE
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/About */}
      <div id="about" className="border-y border-border bg-card/50 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { label: "SUBSCRIBERS", value: ytStats?.subscribers ?? "51K" },
            { label: "VIEWS", value: ytStats?.views ?? "2.9M+" },
            { label: "LIKES", value: ytStats?.likes ?? "43.7K+" },
            { label: "COMMENTS", value: ytStats?.comments ?? "1.8K" }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 text-center"
            >
              <div className="text-3xl md:text-5xl font-display font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm font-display tracking-widest text-primary">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/message" component={SendMessage} />
      <Route path="/message/success" component={MessageSuccess} />
      <Route path="/videos" component={Videos} />
      <Route path="/upcoming" component={Upcoming} />
      <Route path="/signup" component={SignUp} />
      <Route path="/merch" component={Merch} />
      <Route path="/sponsors" component={Sponsors} />
      <Route path="/donate" component={Donate} />
      <Route path="/donate/thanks" component={() => {
        return (
          <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center px-6">
            <div className="text-center">
              <h1 className="font-display font-bold text-4xl tracking-widest mb-4">THANK <span className="text-primary">YOU</span></h1>
              <p className="text-muted-foreground font-mono">Your donation means everything. You're a legend!</p>
            </div>
          </div>
        );
      }} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
