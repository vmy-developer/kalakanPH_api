import crypto from "crypto";
import { PROFILE_BUCKET, supabase } from "../../../config/storage";

const EXT: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

export const uploadProfilePicture = async (
    file: Express.Multer.File,
): Promise<string> => {
    const path = `${crypto.randomUUID()}.${EXT[file.mimetype]}`;

    const { error } = await supabase.storage
        .from(PROFILE_BUCKET)
        .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) throw error;
    return path; // this goes in users.profile_picture
};

export const deleteProfilePicture = async (path: string): Promise<void> => {
    await supabase.storage.from(PROFILE_BUCKET).remove([path]);
};

export const getProfilePictureUrl = async (
    path: string | null,
): Promise<string | null> => {
    if (!path) return null;
    const { data } = await supabase.storage
        .from(PROFILE_BUCKET)
        .createSignedUrl(path, 60 * 60); // valid 1 hour
    return data?.signedUrl ?? null;
};
