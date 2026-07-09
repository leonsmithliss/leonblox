import { Router, type IRouter } from "express";
import healthRouter from "./health";
import youtubeRouter from "./youtube";
import youtubeVideosRouter from "./youtube-videos";
import youtubeContentRouter from "./youtube-content";
import youtubeAuthRouter from "./youtube-auth";
import youtubeLiveStatusRouter from "./youtube-live-status";
import youtubeUpcomingRouter from "./youtube-upcoming";
import signupRouter from "./signup";
import adminExportRouter from "./admin-export";
import adminSignupsRouter from "./admin-signups";
import stripeCheckoutRouter from "./stripe-checkout";
import stripeSeedRouter from "./stripe-seed";
import sponsorInquiryRouter from "./sponsor-inquiry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(youtubeRouter);
router.use(youtubeVideosRouter);
router.use(youtubeContentRouter);
router.use(youtubeAuthRouter);
router.use(youtubeLiveStatusRouter);
router.use(youtubeUpcomingRouter);
router.use(signupRouter);
router.use(adminExportRouter);
router.use(adminSignupsRouter);
router.use(stripeCheckoutRouter);
router.use(stripeSeedRouter);
router.use(sponsorInquiryRouter);

export default router;
