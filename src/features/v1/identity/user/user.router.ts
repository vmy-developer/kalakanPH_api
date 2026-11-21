import express from "express";
import {
    getProfileController,
    updateProfileController,
} from "./user.controller";
import { authenticate } from "../../../../common/middleware/authenticate";
import { validate } from "../../../../common/middleware/validate";
import { UpdateProfileSchema } from "./dtos/user.data.dto";

const router = express.Router();

router.get("/profile", authenticate, getProfileController);
router.patch(
    "/profile",
    authenticate,
    validate(UpdateProfileSchema),
    updateProfileController,
);

export default router;
