import { Router, type IRouter } from "express";
import { z } from "zod";
import { sendMail } from "../lib/mailer";

const router: IRouter = Router();

const inquirySchema = z.object({
  company: z.string().min(1),
  about: z.string().min(1),
  proposal: z.string().min(1),
});

router.post("/sponsor-inquiry", async (req, res) => {
  const result = inquirySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }

  const { company, about, proposal } = result.data;

  await sendMail(
    `Sponsorship Inquiry from ${company}`,
    `Company: ${company}\n\nAbout:\n${about}\n\nProposal:\n${proposal}`
  );

  res.json({ ok: true });
});

export default router;
