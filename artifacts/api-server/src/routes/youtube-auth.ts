import { Router, type IRouter } from "express";

const router: IRouter = Router();

const REDIRECT_URI = `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/youtube/callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

router.get("/auth/youtube", (_req, res) => {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("YOUTUBE_OAUTH_CLIENT_ID secret is not set.");
    return;
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  res.redirect(url.toString());
});

router.get("/auth/youtube/callback", async (req, res) => {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    res.status(400).send(`OAuth error: ${error ?? "no code returned"}`);
    return;
  }

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send("OAuth credentials not configured.");
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.refresh_token) {
      res.status(400).send(`Token exchange failed: ${tokenData.error ?? "no refresh_token returned"}`);
      return;
    }

    res.send(`
      <html><body style="font-family:monospace;padding:40px;background:#0a0a0a;color:#00ffff">
        <h2 style="color:#00ffff">Authorization successful!</h2>
        <p style="color:#fff">Copy the refresh token below and add it as a Replit secret named <strong>YOUTUBE_REFRESH_TOKEN</strong>:</p>
        <textarea readonly style="width:100%;height:80px;background:#111;color:#0f0;border:1px solid #00ffff;padding:10px;font-size:14px">${tokenData.refresh_token}</textarea>
        <p style="color:#888;margin-top:20px">Once you've saved the secret, the site will automatically start showing your full view count including Shorts.</p>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send(`Server error during token exchange: ${String(err)}`);
  }
});

export default router;
