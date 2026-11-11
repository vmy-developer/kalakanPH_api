import express from "express";
import {
    registerController,
    resendVerificationController,
    verifyEmailController,
} from "./auth.controller";
import {
    RegisterUserSchema,
    ResendVerificationSchema,
    VerifyEmailSchema,
} from "./dtos/auth.data.dto";
import { limiters } from "../../../../common/middleware/rateLimiter";
import { validate } from "../../../../common/middleware/validate";
import { uploadProfilePicture } from "../../../../common/utils/storage/upload";

const router = express.Router();

router.post(
    "/register",
    limiters.register,
    uploadProfilePicture,
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
    limiters.resendVerification,
    validate(ResendVerificationSchema),
    resendVerificationController,
);

export default router;
