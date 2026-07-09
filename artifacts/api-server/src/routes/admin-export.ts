import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { signupsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/admin/export-signups", async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  const provided = req.query.secret;

  if (!secret || provided !== secret) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const rows = await db
      .select()
      .from(signupsTable)
      .orderBy(signupsTable.createdAt);

    const lines = [
      "Name,Email,Signed Up",
      ...rows.map((r) => {
        const name = `"${r.name.replace(/"/g, '""')}"`;
        const email = `"${r.email.replace(/"/g, '""')}"`;
        const date = new Date(r.createdAt).toLocaleString("en-US", {
          timeZone: "America/New_York",
        });
        return `${name},${email},"${date} EST"`;
      }),
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="leonblox-signups-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(lines.join("\r\n"));
  } catch (err) {
    req.log.error({ err }, "Export failed");
    res.status(500).send("Export failed");
  }
});

export default router;
