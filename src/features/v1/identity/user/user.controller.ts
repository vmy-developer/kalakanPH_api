import type { Request, Response } from "express";
import * as userService from "./user.service";

export const getProfileController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.getProfileService(req.user!.id);
    res.status(200).json({ data });
};
