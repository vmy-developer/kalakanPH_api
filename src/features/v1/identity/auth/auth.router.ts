import express from "express";
import {
    loginController,
    logoutController,
    meController,
    registerController,
    resendVerificationController,
    verifyEmailController,
} from "./auth.controller";
import {
    LoginSchema,
    RegisterUserSchema,
    VerifyEmailSchema,
} from "./dtos/auth.data.dto";
import { limiters } from "../../../../common/middleware/rateLimiter";
import { validate } from "../../../../common/middleware/validate";
import { uploadProfilePic } from "../../../../common/utils/storage/upload";
import { authenticate } from "../../../../common/middleware/authenticate";

const router = express.Router();

router.post(
    "/register",
    limiters.register,
    uploadProfilePic,
    validate(RegisterUserSchema),
    registerController,
);

router.get(
    "/verify-email",
    limiters.verify,
    validate(VerifyEmailSchema, "query"),
    verifyEmailController,
);

router.post(
    "/resend-verification",
    authenticate,
    limiters.resendVerification,
    resendVerificationController,
);

router.post("/login", limiters.login, validate(LoginSchema), loginController);

router.post("/logout", authenticate, logoutController);

router.get("/me", authenticate, meController);

export default router;
