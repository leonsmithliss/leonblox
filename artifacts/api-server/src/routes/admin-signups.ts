import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { signupsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/signups", async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  const provided = req.query.secret;

  if (!secret || provided !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(signupsTable)
      .orderBy(desc(signupsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch signups");
    res.status(500).json({ error: "Failed to fetch signups" });
  }
});

export default router;
