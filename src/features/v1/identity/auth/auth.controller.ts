import { Request, Response } from "express";
import * as authService from "./auth.service";
import { RegisterData } from "./dtos/auth.data.dto";

export const registerController = async (
    req: Request<object, object, RegisterData>,
    res: Response,
): Promise<void> => {
    const user = await authService.registerService(req.body, req.file);

    res.status(201).json({
        message: "User created successfully",
        data: user,
    });
};

export const verifyEmailController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const result = await authService.verifyEmailService(
        req.query as { token: string },
    );
    res.status(200).json({
        message: "Email verified successfully",
        data: result,
    });
};
