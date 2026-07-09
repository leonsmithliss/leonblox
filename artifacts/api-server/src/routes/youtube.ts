import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { subscribers: number; views: number; likes: number; comments: number } | null = null;
let cacheExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("OAuth credentials not set");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`Token refresh failed: ${data.error}`);
  return data.access_token;
}

async function getAnalyticsStats(accessToken: string): Promise<{ views: number; likes: number; comments: number }> {
  const today = new Date().toISOString().split("T")[0];
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&metrics=views,likes,comments&startDate=2000-01-01&endDate=${today}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Analytics API returned ${res.status}`);
  const data = (await res.json()) as { rows?: [[number, number, number]] };
  const row = data.rows?.[0] ?? [0, 0, 0];
  return { views: row[0], likes: row[1], comments: row[2] };
}

async function fetchAllVideoIds(apiKey: string, uploadsPlaylistId: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ part: "contentDetails", playlistId: uploadsPlaylistId, maxResults: "50", key: apiKey });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!res.ok) throw new Error(`playlistItems API returned ${res.status}`);
    const data = (await res.json()) as { items?: Array<{ contentDetails?: { videoId?: string } }>; nextPageToken?: string };
    for (const item of data.items ?? []) { if (item.contentDetails?.videoId) ids.push(item.contentDetails.videoId); }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}

async function fetchVideoStatsTotal(apiKey: string, videoIds: string[]): Promise<{ views: number; likes: number; comments: number }> {
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({ part: "statistics", id: batch.join(","), key: apiKey });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) throw new Error(`videos API returned ${res.status}`);
    const data = (await res.json()) as { items?: Array<{ statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }> };
    for (const item of data.items ?? []) {
      totalViews += parseInt(item.statistics?.viewCount ?? "0", 10);
      totalLikes += parseInt(item.statistics?.likeCount ?? "0", 10);
      totalComments += parseInt(item.statistics?.commentCount ?? "0", 10);
    }
  }
  return { views: totalViews, likes: totalLikes, comments: totalComments };
}

router.get("/youtube-stats", async (req, res) => {
  if (cache && Date.now() < cacheExpiresAt) {
    res.json(cache);
    return;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;
  const hasOAuth = !!(process.env.YOUTUBE_REFRESH_TOKEN && process.env.YOUTUBE_OAUTH_CLIENT_ID && process.env.YOUTUBE_OAUTH_CLIENT_SECRET);

  if (!apiKey || !handle) {
    req.log.warn("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_HANDLE");
    res.status(500).json({ error: "Missing YouTube configuration" });
    return;
  }

  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCbFQZPkuFWjp_Zf_Czh0tLQ";
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`
    );
    if (!channelRes.ok) throw new Error(`YouTube API returned ${channelRes.status}`);

    const channelData = (await channelRes.json()) as {
      items?: Array<{
        statistics?: { subscriberCount?: string; viewCount?: string };
        contentDetails?: { relatedPlaylists?: { uploads?: string } };
      }>;
    };

    const item = channelData.items?.[0];
    if (!item) throw new Error("No channel data returned from YouTube API");

    const subscribers = parseInt(item.statistics?.subscriberCount ?? "0", 10);
    let views = parseInt(item.statistics?.viewCount ?? "0", 10);
    let likes = 0;
    let comments = 0;

    if (hasOAuth) {
      try {
        const accessToken = await getAccessToken();
        const analyticsStats = await getAnalyticsStats(accessToken);
        views = analyticsStats.views;
        likes = analyticsStats.likes;
        comments = analyticsStats.comments;
        req.log.info({ views, likes, comments }, "Using YouTube Analytics API");
      } catch (analyticsErr) {
        req.log.warn({ err: analyticsErr }, "Analytics API failed, falling back to Data API for all stats");
        const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
        if (uploadsPlaylistId) {
          const videoIds = await fetchAllVideoIds(apiKey, uploadsPlaylistId);
          const totals = await fetchVideoStatsTotal(apiKey, videoIds);
          views = totals.views;
          likes = totals.likes;
          comments = totals.comments;
        }
      }
    } else {
      const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
      if (uploadsPlaylistId) {
        const videoIds = await fetchAllVideoIds(apiKey, uploadsPlaylistId);
        const totals = await fetchVideoStatsTotal(apiKey, videoIds);
        views = totals.views;
        likes = totals.likes;
        comments = totals.comments;
      }
    }

    const viewsOverride = process.env.YOUTUBE_VIEWS_OVERRIDE;
    if (viewsOverride) views = parseInt(viewsOverride, 10);

    cache = { subscribers, views, likes, comments };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    res.json(cache);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch YouTube stats");
    if (cache) { res.json(cache); return; }
    res.status(502).json({ error: "Failed to fetch YouTube stats", detail: String(err) });
  }
});

export default router;
