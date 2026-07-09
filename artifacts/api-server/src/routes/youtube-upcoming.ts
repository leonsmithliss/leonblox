import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CACHE_TTL_MS = 5 * 60 * 1000;

interface UpcomingStream {
  id: string;
  title: string;
  thumbnail: string;
  scheduledAt: string;
  url: string;
}

let cache: UpcomingStream[] | null = null;
let cacheExpiresAt = 0;

router.get("/youtube-upcoming", async (req, res) => {
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;

  if (!apiKey || !handle) {
    res.json([]);
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
      res.json([]);
      return;
    }

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&maxResults=10&key=${apiKey}`
    );
    const searchData = (await searchRes.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          publishedAt?: string;
          thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
        };
      }>;
    };

    const items = searchData.items ?? [];
    const videoIds = items.map((i) => i.id?.videoId).filter(Boolean).join(",");

    let scheduledMap: Record<string, string> = {};
    if (videoIds) {
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoIds}&key=${apiKey}`
      );
      const detailsData = (await detailsRes.json()) as {
        items?: Array<{
          id?: string;
          liveStreamingDetails?: { scheduledStartTime?: string };
        }>;
      };
      for (const v of detailsData.items ?? []) {
        if (v.id && v.liveStreamingDetails?.scheduledStartTime) {
          scheduledMap[v.id] = v.liveStreamingDetails.scheduledStartTime;
        }
      }
    }

    const streams: UpcomingStream[] = items
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
          scheduledAt: scheduledMap[videoId] ?? item.snippet?.publishedAt ?? "",
          url: `https://www.youtube.com/watch?v=${videoId}`,
        };
      })
      .filter((v) => v.id)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    cache = streams;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    res.json(streams);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch upcoming streams");
    res.json(cache ?? []);
  }
});

export default router;
