import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import * as authService from "./auth.service";
import type {
    LoginInput,
    RegisterData,
    VerifyEmailInput,
} from "./dtos/auth.data.dto";
import { getUserId } from "../../../../common/http/request";
import { sendCreated, sendOk } from "../../../../common/http/response";
import {
    clearAuthCookie,
    setAuthCookie,
} from "../../../../common/utils/auth/authCookie";

export const registerController = async (
    req: Request<ParamsDictionary, unknown, RegisterData>,
    res: Response,
): Promise<void> => {
    const user = await authService.registerService(req.body, req.file);

    setAuthCookie(res, user.userId);
    sendCreated(res, { message: "User created successfully", data: user });
};

export const verifyEmailController = async (
    req: Request<ParamsDictionary, unknown, unknown, VerifyEmailInput>,
    res: Response,
): Promise<void> => {
    const result = await authService.verifyEmailService(req.query);

    sendOk(res, { message: "Email verified successfully", data: result });
};

export const resendVerificationController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    await authService.resendVerificationService(getUserId(req));

    sendOk(res, { message: "Verification email sent" });
};

export const loginController = async (
    req: Request<ParamsDictionary, unknown, LoginInput>,
    res: Response,
): Promise<void> => {
    const user = await authService.loginService(req.body);

    setAuthCookie(res, user.userId);

    sendOk(res, {
        message: user.isVerified ? "Logged in successfully" : "Need to verify",
        data: user,
    });
};

export const logoutController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    await authService.logoutService(getUserId(req));

    clearAuthCookie(res);
    sendOk(res, { message: "Logged out successfully" });
};

export const meController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await authService.meService(getUserId(req));

    sendOk(res, { data });
};
