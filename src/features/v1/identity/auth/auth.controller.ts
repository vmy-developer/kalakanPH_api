import { Request, Response } from "express";
import * as authService from "./auth.service";
import {
    RegisterData,
    ResendVerificationInput,
    VerifyEmailInput,
} from "./dtos/auth.data.dto";
import { setAuthCookie } from "../../../../common/middleware/setAuthCookie";

export const registerController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const user = await authService.registerService(
        req.body as RegisterData,
        req.file,
    );

    setAuthCookie(res, user.userId);

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
        req.query as VerifyEmailInput,
    );
    res.status(200).json({
        message: "Email verified successfully",
        data: result,
    });
};

export const resendVerificationController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    await authService.resendVerificationService(
        req.body as ResendVerificationInput,
    );
    res.status(200).json({
        message: "A new verification email has been sent",
    });
};
