import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CACHE_TTL_MS = 2 * 60 * 1000;
let cache: { isLive: boolean; title?: string } | null = null;
let cacheExpiresAt = 0;

router.get("/youtube-live-status", async (req, res) => {
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;

  if (!apiKey || !handle) {
    res.json({ isLive: false });
    return;
  }

  try {
    const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(normalizedHandle)}&key=${apiKey}`
    );
    const channelData = (await channelRes.json()) as {
      items?: Array<{ id?: string }>;
    };
    const channelId = channelData.items?.[0]?.id;
    if (!channelId) {
      res.json({ isLive: false });
      return;
    }

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
    );
    const searchData = (await searchRes.json()) as {
      items?: Array<{ snippet?: { title?: string } }>;
    };

    const isLive = (searchData.items?.length ?? 0) > 0;
    const title = searchData.items?.[0]?.snippet?.title;

    cache = { isLive, title };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    res.json(cache);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch YouTube live status");
    res.json({ isLive: false });
  }
});

export default router;
