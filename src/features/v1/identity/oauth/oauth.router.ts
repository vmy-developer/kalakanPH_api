import express from "express";
import { limiters } from "../../../../common/middleware/rateLimiter";
import { validate } from "../../../../common/middleware/validate";
import { GoogleLoginSchema, GoogleRegisterSchema } from "./dtos/oauth.data.dto";
import {
    googleLoginController,
    googleRegisterController,
} from "./oauth.controller";

const router = express.Router();

router.post(
    "/google",
    limiters.login,
    validate(GoogleLoginSchema),
    googleLoginController,
);

router.post(
    "/google/register",
    limiters.register,
    validate(GoogleRegisterSchema),
    googleRegisterController,
);

export default router;
