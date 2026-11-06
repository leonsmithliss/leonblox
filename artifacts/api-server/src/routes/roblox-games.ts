import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CREATOR_ID = 1512057012;
const STUDIO_GROUP_ID = 173769384;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FEATURED_GAME_PLACE_IDS = new Set([
  132710196490511, // Wash Cars
  128894988008491, // Roadster Vs Cops
  112922142920016, // Deep Dive Dubai
  99657258105359, // Math Island
  81170019381237, // +1 Speed Needoh Escape
]);

interface CatalogGame {
  id: number;
  name: string;
  description?: string | null;
  created: string;
  updated?: string;
  placeVisits?: number;
  rootPlace?: { id?: number };
  creator?: { type?: string };
}

interface GameDetails {
  id: number;
  description?: string | null;
  playing?: number;
  visits?: number;
  maxPlayers?: number;
  favoritedCount?: number;
  genre?: string;
  genre_l1?: string;
  genre_l2?: string;
  rootPlaceId?: number;
}

interface RobloxGame {
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
}

interface RobloxPortfolio {
  games: RobloxGame[];
  creatorId: number;
  groupId: number;
  groupName: string;
  groupMemberCount: number | null;
  updatedAt: string;
}

let cache: RobloxPortfolio | null = null;
let cacheExpiresAt = 0;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "LeonBloxWebsite/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Roblox API returned ${response.status}`);
  }
  return (await response.json()) as T;
}

async function fetchCatalogGames(url: string): Promise<CatalogGame[]> {
  const games: CatalogGame[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const pageUrl = new URL(url);
    if (cursor) pageUrl.searchParams.set("cursor", cursor);

    const result = await fetchJson<{
      data?: CatalogGame[];
      nextPageCursor?: string | null;
    }>(pageUrl.toString());
    games.push(...(result.data ?? []));
    cursor = result.nextPageCursor ?? undefined;
    if (!cursor) break;
  }

  return games;
}

async function buildPortfolio(): Promise<RobloxPortfolio> {
  const [userGamesResult, groupGamesResult] = await Promise.allSettled([
    fetchCatalogGames(
      `https://games.roblox.com/v2/users/${CREATOR_ID}/games?accessFilter=Public&sortOrder=Asc&limit=50`,
    ),
    fetchCatalogGames(
      `https://games.roblox.com/v2/groups/${STUDIO_GROUP_ID}/games?accessFilter=Public&sortOrder=Asc&limit=50`,
    ),
  ]);

  const catalogGames = [
    ...(userGamesResult.status === "fulfilled" ? userGamesResult.value : []),
    ...(groupGamesResult.status === "fulfilled" ? groupGamesResult.value : []),
  ];

  if (catalogGames.length === 0) {
    const reason =
      userGamesResult.status === "rejected"
        ? userGamesResult.reason
        : groupGamesResult.status === "rejected"
          ? groupGamesResult.reason
          : "No public Roblox experiences were returned";
    throw reason instanceof Error ? reason : new Error(String(reason));
  }

  const uniqueGames = Array.from(
    new Map(catalogGames.map((game) => [game.id, game])).values(),
  ).filter((game) => FEATURED_GAME_PLACE_IDS.has(game.rootPlace?.id ?? 0));
  if (uniqueGames.length === 0) {
    throw new Error("None of the selected public Roblox experiences were returned");
  }
  const ids = uniqueGames.map((game) => game.id);

  const [detailsResult, thumbnailsResult, groupResult] = await Promise.allSettled([
    fetchJson<{ data?: GameDetails[] }>(
      `https://games.roblox.com/v1/games?universeIds=${ids.join(",")}`,
    ),
    fetchJson<{
      data?: Array<{ targetId: number; imageUrl?: string; state?: string }>;
    }>(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids.join(",")}&size=512x512&format=Png&isCircular=false`,
    ),
    fetchJson<{ id?: number; name?: string; memberCount?: number }>(
      `https://groups.roblox.com/v1/groups/${STUDIO_GROUP_ID}`,
    ),
  ]);

  const detailById = new Map(
    detailsResult.status === "fulfilled"
      ? (detailsResult.value.data ?? []).map((detail) => [detail.id, detail])
      : [],
  );
  const iconById = new Map(
    thumbnailsResult.status === "fulfilled"
      ? (thumbnailsResult.value.data ?? [])
          .filter((thumbnail) => thumbnail.state === "Completed" && thumbnail.imageUrl)
          .map((thumbnail) => [thumbnail.targetId, thumbnail.imageUrl as string])
      : [],
  );
  const group = groupResult.status === "fulfilled" ? groupResult.value : null;

  const games = uniqueGames
    .map((game): RobloxGame => {
      const details = detailById.get(game.id);
      return {
        id: game.id,
        rootPlaceId: game.rootPlace?.id ?? details?.rootPlaceId ?? game.id,
        name: game.name || "Untitled Experience",
        description: details?.description?.trim() || game.description?.trim() || "",
        created: game.created,
        updated: game.updated ?? null,
        visits: details?.visits ?? game.placeVisits ?? 0,
        playing: details?.playing ?? 0,
        maxPlayers: details?.maxPlayers ?? null,
        favorites: details?.favoritedCount ?? 0,
        genre: details?.genre_l1 || details?.genre || null,
        subgenre: details?.genre_l2 || null,
        icon: iconById.get(game.id) ?? null,
        creatorType: game.creator?.type === "Group" ? "Group" : "User",
      };
    })
    .sort((a, b) => Date.parse(a.created) - Date.parse(b.created));

  return {
    games,
    creatorId: CREATOR_ID,
    groupId: STUDIO_GROUP_ID,
    groupName: group?.name ?? "LeonBloxStudios",
    groupMemberCount: group?.memberCount ?? null,
    updatedAt: new Date().toISOString(),
  };
}

router.get("/roblox-games", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  try {
    cache = await buildPortfolio();
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    res.json(cache);
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch Roblox games");
    res.status(502).json({ error: "Could not load public Roblox games right now" });
  }
});

export default router;
