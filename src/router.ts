import { Router } from "express";
import { authRouter } from "./features/v1/identity/auth";

const router = Router();

router.use("/identity/auth", authRouter);

export default router;
