import { Router } from "express";
import { authRouter } from "./features/v1/identity/auth";
import { oauthRouter } from "./features/v1/identity/oauth";
import { userRouter } from "./features/v1/identity/user";

const router = Router();

router.use("/identity/auth", authRouter);
router.use("/identity/oauth", oauthRouter);
router.use("/identity/user", userRouter);

export default router;
