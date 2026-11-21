import express from "express";
import {
    changePasswordController,
    getProfileController,
    updatePictureController,
    updateProfileController,
} from "./user.controller";
import { authenticate } from "../../../../common/middleware/authenticate";
import { validate } from "../../../../common/middleware/validate";
import {
    ChangePasswordSchema,
    UpdateProfileSchema,
} from "./dtos/user.data.dto";
import { uploadProfilePic } from "../../../../common/utils/storage/upload";

const router = express.Router();

router.get("/profile", authenticate, getProfileController);

router.patch(
    "/profile",
    authenticate,
    validate(UpdateProfileSchema),
    updateProfileController,
);

router.patch(
    "/profile/picture",
    authenticate,
    uploadProfilePic,
    updatePictureController,
);

router.patch(
    "/profile/change-password",
    authenticate,
    validate(ChangePasswordSchema),
    changePasswordController,
);

export default router;
