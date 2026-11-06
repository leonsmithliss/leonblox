import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Gamepad2,
  Heart,
  Play,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import { Button } from "@/components/ui/button";

type RobloxGame = {
  id: number;
  rootPlaceId: number;
  name: string;
  description: string;
  created: string;
  updated: string | null;
  visits: number;
  playing: number;
  maxPlayers: number | null;
  favorites: number;
  genre: string | null;
  subgenre: string | null;
  icon: string | null;
  creatorType: "User" | "Group";
};

type RobloxPortfolio = {
  games: RobloxGame[];
  creatorId: number;
  groupId: number;
  groupName: string;
  groupMemberCount: number | null;
  updatedAt: string;
};

type PortfolioTab = "games" | "milestones";

const userReportedMilestones = [
  {
    icon: Trophy,
    number: "500K+",
    title: "Game visits",
    detail: "Combined visits across all of Leon's Roblox games.",
    accent: "from-cyan-400/25 to-blue-500/5",
    tag: "COMMUNITY MILESTONE",
  },
];

const winScreenshotsBase = `${import.meta.env.BASE_URL}images/roblox-wins/`;
const robloxWinScreenshots = [
  {
    src: `${winScreenshotsBase}shooting-arena-overview.webp`,
    alt: "Shooting Arena Creator Dashboard overview showing realtime analytics",
    title: "Shooting Arena — realtime analytics",
    detail: "The dashboard snapshot shows 734 concurrent users, 3.1-minute session time, and a 1.68% client crash rate.",
  },
  {
    src: `${winScreenshotsBase}robux-activity.webp`,
    alt: "Roblox Creator Dashboard chart for daily Robux spent",
    title: "Robux activity",
    detail: "12,788 Robux spent over the selected period, averaging 441 per day.",
  },
  {
    src: `${winScreenshotsBase}shooting-arena-visits.webp`,
    alt: "Shooting Arena Creator Dashboard showing 80.6K visits and active users",
    title: "80.6K+ Shooting Arena visits",
    detail: "The Creator Dashboard snapshot also shows 978 active users.",
  },
  {
    src: `${winScreenshotsBase}pending-robux.webp`,
    alt: "Roblox Creator Dashboard showing 132,935 pending Robux",
    title: "132,935 pending Robux",
    detail: "Pending Robux amount shown in the Creator Dashboard screenshot.",
  },
  {
    src: `${winScreenshotsBase}studio-community.webp`,
    alt: "LeonBloxStudios Roblox community profile showing 59.8K members",
    title: "LeonBloxStudios community",
    detail: "Your Roblox studio group profile, shown with 59.8K+ members.",
  },
];

function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function fullNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function AnimatedVisitCount() {
  const count = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const displayCount = useTransform(count, (latest) => {
    const value = Math.floor(latest);
    return value < 1000 ? fullNumber(value) : `${Math.floor(value / 1000)}K`;
  });

  useEffect(() => {
    const controls = animate(count, 500_000, {
      duration: prefersReducedMotion ? 0 : 1.65,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [count, prefersReducedMotion]);

  return (
    <motion.span aria-label="At least 500,000 visits combined across all Roblox games" data-testid="counter-total-game-visits">
      {displayCount}
    </motion.span>
  );
}

function GameCard({ game, index }: { game: RobloxGame; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.article
      data-testid={`card-roblox-game-${game.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min((index % 4) * 0.06, 0.18) }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101923] shadow-[0_16px_55px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_20px_65px_rgba(34,211,238,0.12)]"
    >
      <a
        href={`https://www.roblox.com/games/${game.rootPlaceId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`Open ${game.name} on Roblox`}
        data-testid={`link-roblox-game-${game.id}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950">
          {game.icon && !imageFailed ? (
            <img
              src={game.icon}
              alt={`${game.name} Roblox game icon`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              data-testid={`img-roblox-game-${game.id}`}
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              data-testid={`img-fallback-roblox-game-${game.id}`}
            >
              <Gamepad2 className="h-12 w-12 text-cyan-300/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur">
              {game.creatorType === "Group" ? "STUDIO" : "CREATOR"}
            </span>
            {game.playing > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-950/70 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                {compactNumber(game.playing)} playing
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white">{game.name}</h3>
            </div>
            <span className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition group-hover:bg-cyan-300 group-hover:text-slate-950">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </div>
      </a>

      <div className="p-4 sm:p-5">
        {game.description ? (
          <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-300/70">
            {game.description}
          </p>
        ) : (
          <p className="mb-4 min-h-10 text-sm leading-relaxed text-slate-300/45">
            A Roblox experience by LeonBlox.
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">VISITS</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
              <Play className="h-3.5 w-3.5 text-cyan-300" />
              {compactNumber(game.visits)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">FAVORITES</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
              <Heart className="h-3.5 w-3.5 text-pink-300" />
              {compactNumber(game.favorites)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">GENRE</p>
            <p className="mt-1 truncate text-sm font-bold text-white">{game.genre || "Roblox"}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function RobloxGamesPage() {
  const [portfolio, setPortfolio] = useState<RobloxPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<PortfolioTab>("games");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/roblox-games", { cache: "no-store" });
        if (!response.ok) throw new Error("Roblox game data is temporarily unavailable.");
        const data = (await response.json()) as RobloxPortfolio;
        if (active) setPortfolio(data);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load Roblox games.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 10 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [retryKey]);

  const visibleGames = portfolio?.games ?? [];
  const firstOrderedGame = portfolio?.games[0];
  const latestUpdate = portfolio?.updatedAt ? formatDate(portfolio.updatedAt) : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#080e16] text-white">
      <SiteNav />

      <section className="relative px-5 pb-14 pt-32 sm:px-8 sm:pt-36 lg:px-12 lg:pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-16 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(8,145,178,0.22),transparent_63%)]" />
        <div className="pointer-events-none absolute -right-40 top-48 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"
          >
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                ROBLOX CREATOR PORTFOLIO
              </div>
              <h1 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
                Built to be
                <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text pb-2 text-transparent">
                  played.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300/75 sm:text-lg">
                Five handpicked Roblox experiences, arranged newest to oldest.
              </p>
            </div>

            <a
              href={`https://www.roblox.com/users/${portfolio?.creatorId ?? 1512057012}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              data-testid="link-roblox-profile"
            >
              Visit Roblox profile <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111825]/95 via-[#0d131d]/95 to-[#131125]/95 shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
            data-testid="stats-portfolio-summary"
          >
            <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex items-center justify-center gap-4 px-5 py-6 sm:py-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight sm:text-4xl" aria-live="polite">
                    <AnimatedVisitCount /><span className="text-cyan-300">+</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Combined game visits</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 px-5 py-6 sm:py-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200 shadow-[0_0_28px_rgba(167,139,250,0.1)]">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight sm:text-4xl">5</p>
                  <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Featured experiences</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 px-5 py-6 sm:py-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-300/20 bg-pink-300/10 text-pink-200 shadow-[0_0_28px_rgba(244,114,182,0.1)]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight sm:text-4xl">
                    {portfolio?.groupMemberCount ? `${compactNumber(portfolio.groupMemberCount)}+` : "59.8K+"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">Studio community members</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("games")}
                aria-pressed={activeTab === "games"}
                data-testid="tab-games"
                className={`relative px-4 py-4 text-sm font-bold transition ${activeTab === "games" ? "text-white" : "text-slate-400 hover:text-white"}`}
              >
                Games
                {activeTab === "games" && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan-300" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("milestones")}
                aria-pressed={activeTab === "milestones"}
                data-testid="tab-milestones"
                className={`relative px-4 py-4 text-sm font-bold transition ${activeTab === "milestones" ? "text-white" : "text-slate-400 hover:text-white"}`}
              >
                Wins & milestones
                {activeTab === "milestones" && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan-300" />}
              </button>
            </div>
            {activeTab === "games" && latestUpdate && (
              <span className="flex items-center gap-1.5 pb-1 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3" />
                Roblox data refreshed {latestUpdate}
              </span>
            )}
          </div>

          {activeTab === "games" ? (
            <section className="pt-8" aria-label="Roblox game collection">
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    NEWEST TO OLDEST
                  </div>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Featured games</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Five selected experiences, with live stats and icons from Roblox.
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                      <div className="aspect-[16/10] bg-white/[0.06]" />
                      <div className="space-y-3 p-5">
                        <div className="h-4 w-2/3 rounded bg-white/10" />
                        <div className="h-3 w-full rounded bg-white/[0.07]" />
                        <div className="h-8 rounded bg-white/[0.05]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-8 text-center" data-testid="status-games-error">
                  <p className="text-lg font-bold">Couldn’t load the Roblox catalog</p>
                  <p className="mt-2 text-sm text-slate-300">{error}</p>
                  <Button
                    type="button"
                    onClick={() => setRetryKey((key) => key + 1)}
                    className="mt-5 bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
                    data-testid="button-retry-games"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Try again
                  </Button>
                </div>
              )}

              {!isLoading && !error && visibleGames.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleGames.map((game, index) => (
                    <GameCard key={game.id} game={game} index={index} />
                  ))}
                </div>
              )}

              {!isLoading && !error && visibleGames.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] py-16 text-center" data-testid="status-no-games">
                  <Gamepad2 className="mx-auto h-8 w-8 text-slate-500" />
                  <p className="mt-3 font-semibold text-white">The selected games aren’t available right now.</p>
                  <p className="mt-1 text-sm text-slate-400">Roblox may be temporarily unavailable. Try again shortly.</p>
                </div>
              )}

              {!isLoading && !error && firstOrderedGame && (
                <p className="mt-7 text-xs text-slate-500">
                  Newest game in your selected order: {firstOrderedGame.name}.
                </p>
              )}
            </section>
          ) : (
            <section className="pt-10" aria-label="Roblox wins and milestones">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-w-2xl"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  BUILT WITH THE ROBLOX COMMUNITY
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Wins worth celebrating</h2>
                <p className="mt-3 leading-relaxed text-slate-300/70">
                  Milestones from across the Roblox creator journey.
                </p>
              </motion.div>

              <div className="relative grid gap-4 md:grid-cols-2">
                <div className="pointer-events-none absolute bottom-12 left-1/2 top-12 hidden w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300/50 via-violet-300/35 to-transparent md:block" />
                {userReportedMilestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  return (
                    <motion.article
                      key={milestone.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${milestone.accent} p-6 sm:p-8`}
                      data-testid={`card-milestone-${index}`}
                    >
                      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/[0.07]" />
                      <div className="relative flex items-start justify-between">
                        <div>
                          <span className="inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-bold tracking-[0.17em] text-white/75">
                            {milestone.tag}
                          </span>
                          <p className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{milestone.number}</p>
                          <h3 className="mt-2 text-xl font-bold">{milestone.title}</h3>
                          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-200/70">{milestone.detail}</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/20">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </motion.article>
                  );
                })}

                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative rounded-2xl border border-white/10 bg-[#101923] p-6 sm:p-8"
                  data-testid="card-milestone-studio"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border border-pink-300/20 bg-pink-300/[0.08] px-3 py-1 text-[10px] font-bold tracking-[0.17em] text-pink-200">
                      COMMUNITY
                    </span>
                    <Users className="h-5 w-5 text-pink-200" />
                  </div>
                  <p className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                    {portfolio?.groupMemberCount ? `${compactNumber(portfolio.groupMemberCount)}+` : "59K+"}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">LeonBloxStudios members</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/70">
                    Roblox group membership, fetched live from the public group profile.
                  </p>
                  <a
                    href={`https://www.roblox.com/communities/${portfolio?.groupId ?? 173769384}/LeonBloxStudios`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100"
                    data-testid="link-roblox-studio-group"
                  >
                    Visit the studio group <ArrowUpRight className="h-4 w-4" />
                  </a>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative rounded-2xl border border-white/10 bg-[#101923] p-6 sm:p-8"
                  data-testid="card-milestone-library"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3 py-1 text-[10px] font-bold tracking-[0.17em] text-violet-200">
                      THE JOURNEY
                    </span>
                    <Clock3 className="h-5 w-5 text-violet-200" />
                  </div>
                  <p className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                    {isLoading ? "—" : `${portfolio?.games.length ?? 0}`}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">Featured experiences</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/70">
                    {firstOrderedGame
                      ? `${firstOrderedGame.name} leads your selected newest-to-oldest game order.`
                      : "Your selected games are arranged newest to oldest."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("games")}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100"
                    data-testid="button-view-game-library"
                  >
                    Browse the game library <ArrowUpRight className="h-4 w-4" />
                  </button>
                </motion.article>
              </div>

              <div className="mt-14" aria-labelledby="roblox-wins-gallery-title">
                <div className="mb-6">
                  <p className="text-xs font-bold tracking-[0.2em] text-cyan-200">YOUR ROBLOX SCREENSHOTS</p>
                  <h3 id="roblox-wins-gallery-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Wins from the creator dashboard
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/70">
                    Your Roblox analytics and LeonBloxStudios community screenshots, saved here as part of your milestones.
                  </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {robloxWinScreenshots.map((screenshot, index) => (
                    <motion.figure
                      key={screenshot.title}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: (index % 2) * 0.08 }}
                      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#101923] ${index === 2 || index === 3 ? "md:col-span-2" : ""}`}
                      data-testid={`card-roblox-win-screenshot-${index}`}
                    >
                      <a
                        href={screenshot.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open full-size screenshot: ${screenshot.title}`}
                        data-testid={`link-roblox-win-screenshot-${index}`}
                        className="flex h-64 items-center justify-center overflow-hidden bg-black/50 p-3 sm:h-72"
                      >
                        <img
                          src={screenshot.src}
                          alt={screenshot.alt}
                          loading="lazy"
                          className="h-full w-full object-contain"
                          data-testid={`img-roblox-win-screenshot-${index}`}
                        />
                      </a>
                      <figcaption className="border-t border-white/10 px-5 py-4">
                        <h4 className="font-bold text-white">{screenshot.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300/70">{screenshot.detail}</p>
                      </figcaption>
                    </motion.figure>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-xs leading-relaxed text-slate-400">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p>
                  Game icons, individual stats, and group membership come from Roblox’s public APIs. The 500K+ figure is the combined visit milestone across all your Roblox games.
                </p>
              </div>
            </section>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export default RobloxGamesPage;
