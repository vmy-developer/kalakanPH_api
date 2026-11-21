import { Router } from "express";
import { authRouter } from "./features/v1/identity/auth";
import { oauthRouter } from "./features/v1/identity/oauth";

const router = Router();

router.use("/identity/auth", authRouter);
router.use("/identity/oauth", oauthRouter);

export default router;
