import { Request, Response } from "express";
import * as authService from "./auth.service";
import {
    LoginInput,
    RegisterData,
    VerifyEmailInput,
} from "./dtos/auth.data.dto";
import {
    clearAuthCookie,
    setAuthCookie,
} from "../../../../common/middleware/setAuthCookie";

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
    await authService.resendVerificationService(req.user!.id);

    res.status(200).json({
        message: "Verification email sent",
    });
};

export const loginController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const user = await authService.loginService(req.body as LoginInput);

    setAuthCookie(res, user.userId);

    if (user.isVerified === false) {
        res.status(200).json({ message: "Need to verify", data: user });
        return;
    }

    res.status(200).json({
        message: "Logged in successfully",
        data: user,
    });
};

export const logoutController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    await authService.logoutService(req.user!.id);

    clearAuthCookie(res);

    res.status(200).json({
        message: "Logged out successfully",
    });
};

export const meController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await authService.meService(req.user!.id);
    res.status(200).json({ data });
};
