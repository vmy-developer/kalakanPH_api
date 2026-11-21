import express from "express";
import {
    getProfileController,
    updatePictureController,
    updateProfileController,
} from "./user.controller";
import { authenticate } from "../../../../common/middleware/authenticate";
import { validate } from "../../../../common/middleware/validate";
import { UpdateProfileSchema } from "./dtos/user.data.dto";
import { uploadProfilePicture } from "../../../../common/utils/storage/upload";

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
    uploadProfilePicture,
    updatePictureController,
);

export default router;
