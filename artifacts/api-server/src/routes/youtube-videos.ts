import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: Video[] | null = null;
let cacheExpiresAt = 0;

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
  url: string;
}

router.get("/youtube-videos", async (req, res) => {
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;

  if (!apiKey || !handle) {
    req.log.warn("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_HANDLE");
    res.status(500).json({ error: "Missing YouTube configuration" });
    return;
  }

  try {
    const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;

    // Step 1: get channel ID from handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(normalizedHandle)}&key=${apiKey}`
    );
    if (!channelRes.ok) throw new Error(`channels API returned ${channelRes.status}`);
    const channelData = (await channelRes.json()) as {
      items?: Array<{ id?: string }>;
    };
    const channelId = channelData.items?.[0]?.id;
    if (!channelId) throw new Error("Could not find channel ID");

    // Step 2: search for videos ordered by upload date (most recent first)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=50&type=video&key=${apiKey}`
    );
    if (!searchRes.ok) throw new Error(`search API returned ${searchRes.status}`);
    const searchData = (await searchRes.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          publishedAt?: string;
          thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
        };
      }>;
    };

    const items = searchData.items ?? [];
    const videoIds = items.map((i) => i.id?.videoId).filter(Boolean).join(",");
    if (!videoIds) throw new Error("No videos found");

    // Step 3: fetch view counts for those video IDs
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`
    );
    if (!statsRes.ok) throw new Error(`videos API returned ${statsRes.status}`);
    const statsData = (await statsRes.json()) as {
      items?: Array<{ id?: string; statistics?: { viewCount?: string } }>;
    };

    const viewMap: Record<string, number> = {};
    for (const v of statsData.items ?? []) {
      if (v.id) viewMap[v.id] = parseInt(v.statistics?.viewCount ?? "0", 10);
    }

    const videos: Video[] = items
      .map((item) => {
        const videoId = item.id?.videoId ?? "";
        const thumbnail =
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        return {
          id: videoId,
          title: item.snippet?.title ?? "Untitled",
          thumbnail,
          viewCount: viewMap[videoId] ?? 0,
          publishedAt: item.snippet?.publishedAt ?? "",
          url: `https://www.youtube.com/watch?v=${videoId}`,
        };
      })
      .filter((v) => v.id)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    cache = videos;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    res.json(videos);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch YouTube videos");
    if (cache) {
      res.json(cache);
      return;
    }
    res.status(502).json({ error: "Failed to fetch YouTube videos" });
  }
});

export default router;
