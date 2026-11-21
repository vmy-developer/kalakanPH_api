import multer from "multer";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const uploadProfilePic = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED.includes(file.mimetype));
    },
}).single("profilePicture");
