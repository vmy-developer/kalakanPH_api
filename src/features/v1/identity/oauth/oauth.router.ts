import express from "express";
import { limiters } from "../../../../common/middleware/rateLimiter";
import { validate } from "../../../../common/middleware/validate";
import { GoogleLoginSchema } from "./dtos/oauth.data.dto";
import { googleLoginController } from "./oauth.controller";

const router = express.Router();

router.post(
    "/google",
    limiters.login,
    validate(GoogleLoginSchema),
    googleLoginController,
);

export default router;
