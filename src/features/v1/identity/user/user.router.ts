import express from "express";
import {
    changePasswordController,
    deleteAccountController,
    getProfileController,
    getPublicProfileController,
    searchUsersController,
    updatePictureController,
    updateProfileController,
} from "./user.controller";
import { authenticate } from "../../../../common/middleware/authenticate";
import { validate } from "../../../../common/middleware/validate";
import {
    ChangePasswordSchema,
    DeleteAccountSchema,
    SearchUsersSchema,
    UpdateProfileSchema,
    UsernameParamSchema,
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

router.get(
    "/search",
    authenticate,
    validate(SearchUsersSchema, "query"),
    searchUsersController,
);

router.get(
    "/:username",
    validate(UsernameParamSchema, "params"),
    getPublicProfileController,
);

router.delete(
    "/profile",
    authenticate,
    validate(DeleteAccountSchema),
    deleteAccountController,
);

export default router;
