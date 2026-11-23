import multer from "multer";
import { MAX_PROFILE_PICTURE_BYTES } from "../../constants/constants";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const uploadProfilePic = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PROFILE_PICTURE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED.includes(file.mimetype));
    },
}).single("profilePicture");
