import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: CategorizedContent | null = null;
let cacheExpiresAt = 0;

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

interface CategorizedContent {
  shorts: Video[];
  livestreams: Video[];
  longform: Video[];
}

function parseDurationSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? "0") * 3600) + (parseInt(m[2] ?? "0") * 60) + parseInt(m[3] ?? "0");
}

async function searchVideoIds(
  channelId: string,
  apiKey: string,
  extra: Record<string, string>
): Promise<{ id: string; title: string; thumbnail: string; publishedAt: string }[]> {
  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    order: "viewCount",
    maxResults: "50",
    type: "video",
    key: apiKey,
    ...extra,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`search API returned ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        publishedAt?: string;
        thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
      };
    }>;
  };
  return (data.items ?? [])
    .map((item) => ({
      id: item.id?.videoId ?? "",
      title: item.snippet?.title ?? "Untitled",
      thumbnail:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${item.id?.videoId}/mqdefault.jpg`,
      publishedAt: item.snippet?.publishedAt ?? "",
    }))
    .filter((v) => v.id);
}

interface EnrichedVideo extends Video {
  durationSeconds: number;
  isLivestream: boolean;
}

async function enrichVideos(
  items: { id: string; title: string; thumbnail: string; publishedAt: string }[],
  apiKey: string
): Promise<EnrichedVideo[]> {
  if (items.length === 0) return [];
  const ids = items.map((v) => v.id).join(",");
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,liveStreamingDetails&id=${ids}&key=${apiKey}`
  );
  if (!res.ok) throw new Error(`videos API returned ${res.status}`);
  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      statistics?: { viewCount?: string };
      contentDetails?: { duration?: string };
      liveStreamingDetails?: object;
    }>;
  };

  const infoMap: Record<string, { viewCount: number; durationSeconds: number; isLivestream: boolean }> = {};
  for (const v of data.items ?? []) {
    if (v.id) {
      infoMap[v.id] = {
        viewCount: parseInt(v.statistics?.viewCount ?? "0", 10),
        durationSeconds: parseDurationSeconds(v.contentDetails?.duration ?? ""),
        isLivestream: v.liveStreamingDetails !== undefined,
      };
    }
  }

  return items
    .map((v) => ({
      ...v,
      viewCount: infoMap[v.id]?.viewCount ?? 0,
      durationSeconds: infoMap[v.id]?.durationSeconds ?? 0,
      isLivestream: infoMap[v.id]?.isLivestream ?? false,
      url: `https://www.youtube.com/watch?v=${v.id}`,
    }))
    .sort((a, b) => b.viewCount - a.viewCount);
}

function toVideo({ durationSeconds: _d, isLivestream: _l, ...v }: EnrichedVideo): Video {
  return v;
}

router.get("/youtube-content", async (req, res) => {
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;

  if (!apiKey || !handle) {
    req.log.warn("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_HANDLE");
    res.status(500).json({ error: "Missing YouTube configuration" });
    return;
  }

  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCbFQZPkuFWjp_Zf_Czh0tLQ";

    // Search all four categories in parallel
    const [shortsRaw, livestreamsRaw, longRaw, mediumRaw] = await Promise.all([
      searchVideoIds(channelId, apiKey, { videoDuration: "short" }),
      searchVideoIds(channelId, apiKey, { eventType: "completed" }),
      searchVideoIds(channelId, apiKey, { videoDuration: "long" }),
      searchVideoIds(channelId, apiKey, { videoDuration: "medium" }),
    ]);

    // Enrich all four in parallel (stats + duration + liveStreamingDetails)
    const [shortsEnriched, livestreamsEnriched, longEnriched, mediumEnriched] = await Promise.all([
      enrichVideos(shortsRaw, apiKey),
      enrichVideos(livestreamsRaw, apiKey),
      enrichVideos(longRaw, apiKey),
      enrichVideos(mediumRaw, apiKey),
    ]);

    // Shorts: ≤ 62 seconds AND not a livestream
    const shorts = shortsEnriched
      .filter((v) => v.durationSeconds <= 62 && !v.isLivestream)
      .map(toVideo);

    // Livestreams: anything flagged as a livestream (from the completed search)
    const livestreams = livestreamsEnriched
      .filter((v) => v.isLivestream)
      .map(toVideo);

    // Long form: medium + long durations, NOT a livestream, deduped
    const seenIds = new Set<string>();
    const longform: Video[] = [];
    for (const v of [...longEnriched, ...mediumEnriched].sort((a, b) => b.viewCount - a.viewCount)) {
      if (!v.isLivestream && !seenIds.has(v.id)) {
        seenIds.add(v.id);
        longform.push(toVideo(v));
      }
    }

    cache = { shorts, livestreams, longform };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    res.json(cache);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch YouTube content");
    if (cache) {
      res.json(cache);
      return;
    }
    res.status(502).json({ error: "Failed to fetch YouTube content" });
  }
});

export default router;
