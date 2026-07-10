import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

router.post("/admin/moderate", async (req, res) => {
  const { secret, id, action } = req.body as {
    secret?: string;
    id?: number;
    action?: "approve" | "decline";
  };

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!id || !action) {
    return res.status(400).json({ error: "Missing id or action" });
  }

  const status = action === "approve" ? "approved" : "declined";

  const { error } = await supabaseAdmin
    .from("messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    req.log.error({ error }, "Failed to update message status");
    return res.status(500).json({ error: "Failed to update" });
  }

  res.json({ ok: true, id, status });
});

export default router;
