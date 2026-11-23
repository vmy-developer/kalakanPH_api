import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { sendCreated, sendOk } from "../../../../common/http/response";
import type {
    GoogleLoginInput,
    GoogleRegisterInput,
} from "./dtos/oauth.data.dto";
import * as oauthService from "./oauth.service";
import { setAuthCookie } from "../../../../common/utils/auth/authCookie";

export const googleLoginController = async (
    req: Request<ParamsDictionary, unknown, GoogleLoginInput>,
    res: Response,
): Promise<void> => {
    const result = await oauthService.googleLoginService(req.body);

    if (result.status === "needs_profile") {
        sendOk(res, { message: "Profile required", data: result });
        return;
    }

    setAuthCookie(res, result.userId);
    sendOk(res, {
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
    req: Request<ParamsDictionary, unknown, GoogleRegisterInput>,
    res: Response,
): Promise<void> => {
    const user = await oauthService.googleRegisterService(req.body);

    setAuthCookie(res, user.userId);
    sendCreated(res, { message: "User created successfully", data: user });
};
