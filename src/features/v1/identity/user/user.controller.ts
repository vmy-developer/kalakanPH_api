import type { Request, Response } from "express";
import * as userService from "./user.service";
import { ChangePasswordInput, UpdateProfileInput } from "./dtos/user.data.dto";

export const getProfileController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.getProfileService(req.user!.id);
    res.status(200).json({ data });
};

export const updateProfileController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.updateProfileService(
        req.user!.id,
        req.body as UpdateProfileInput,
    );
    res.status(200).json({ message: "Profile updated successfully", data });
};

export const updatePictureController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.updatePictureService(req.user!.id, req.file);
    res.status(200).json({ message: "Profile picture updated", data });
};

export const changePasswordController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    await userService.changePasswordService(
        req.user!.id,
        req.body as ChangePasswordInput,
    );
    res.status(200).json({ message: "Password changed successfully" });
};
