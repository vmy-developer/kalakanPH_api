import express from "express";
import { registerController } from "./auth.controller";
import { RegisterUserSchema } from "./dtos/auth.data.dto";
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

export default router;
