import { Request, Response } from "express";
import * as authService from "./auth.service";

export const registerController = async (
    req: Request<object, object, authService.RegisterData>,
    res: Response,
): Promise<void> => {
    const user = await authService.registerService(req.body, req.file);

    res.status(201).json({
        message: "User created successfully",
        data: user,
    });
};
