import { PROFILE_BUCKET, supabase } from "../../../config/storage";
import authRepository from "../../../features/v1/identity/auth/auth.repository";

export const cleanupUnverifiedUsers = async (): Promise<number> => {
    const paths = await authRepository.deleteExpiredUnverified();

    if (paths.length > 0) {
        await supabase.storage
            .from(PROFILE_BUCKET)
            .remove(paths)
            .catch((error) =>
                console.error("💥 Failed to delete pictures:", error),
            );
    }

    return paths.length;
};
