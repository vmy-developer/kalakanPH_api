import { Request, Response } from "express";
import { setAuthCookie } from "../../../../common/middleware/setAuthCookie";
import { GoogleLoginInput, GoogleRegisterInput } from "./dtos/oauth.data.dto";
import * as oauthService from "./oauth.service";

export const googleLoginController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const result = await oauthService.googleLoginService(
        req.body as GoogleLoginInput,
    );

    if (result.status === "needs_profile") {
        res.status(200).json({ message: "Profile required", data: result });
        return;
    }

    setAuthCookie(res, result.userId);
    res.status(200).json({
        message: "Logged in successfully",
        data: {
            status: result.status,
            userId: result.userId,
            email: result.email,
            isVerified: true,
        },
    });
};

export const googleRegisterController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const user = await oauthService.googleRegisterService(
        req.body as GoogleRegisterInput,
    );

    setAuthCookie(res, user.userId);
    res.status(201).json({ message: "User created successfully", data: user });
};
