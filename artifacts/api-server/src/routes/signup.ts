import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { signupsTable, insertSignupSchema } from "@workspace/db";
import { sendMail } from "../lib/mailer";

const router: IRouter = Router();

router.post("/signup", async (req, res) => {
  const result = insertSignupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid data", details: result.error.issues });
    return;
  }

  try {
    await db.insert(signupsTable).values(result.data).onConflictDoNothing();
    await sendMail(
      `New Newsletter Signup: ${result.data.name}`,
      `Name: ${result.data.name}\nEmail: ${result.data.email}`
    );
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Signup insert failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
