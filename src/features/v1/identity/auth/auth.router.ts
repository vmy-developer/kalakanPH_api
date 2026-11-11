import express from "express";
import { registerController, verifyEmailController } from "./auth.controller";
import { RegisterUserSchema, VerifyEmailSchema } from "./dtos/auth.data.dto";
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

export default router;
