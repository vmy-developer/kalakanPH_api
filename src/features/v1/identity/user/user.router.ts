import express from "express";
import { getProfileController } from "./user.controller";
import { authenticate } from "../../../../common/middleware/authenticate";

const router = express.Router();

router.get("/profile", authenticate, getProfileController);

export default router;
