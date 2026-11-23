import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import * as userService from "./user.service";
import type {
    ChangePasswordInput,
    DeleteAccountInput,
    SearchUsersInput,
    UpdateProfileInput,
    UsernameParamInput,
} from "./dtos/user.data.dto";

import { getUserId } from "../../../../common/http/request";
import { sendOk } from "../../../../common/http/response";
import { clearAuthCookie } from "../../../../common/utils/auth/authCookie";

export const getProfileController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.getProfileService(getUserId(req));
    sendOk(res, { data });
};

export const updateProfileController = async (
    req: Request<ParamsDictionary, unknown, UpdateProfileInput>,
    res: Response,
): Promise<void> => {
    const data = await userService.updateProfileService(
        getUserId(req),
        req.body,
    );
    sendOk(res, { message: "Profile updated successfully", data });
};

export const updatePictureController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const data = await userService.updatePictureService(
        getUserId(req),
        req.file,
    );
    sendOk(res, { message: "Profile picture updated", data });
};

export const changePasswordController = async (
    req: Request<ParamsDictionary, unknown, ChangePasswordInput>,
    res: Response,
): Promise<void> => {
    await userService.changePasswordService(getUserId(req), req.body);
    sendOk(res, { message: "Password changed successfully" });
};

export const searchUsersController = async (
    req: Request<ParamsDictionary, unknown, unknown, SearchUsersInput>,
    res: Response,
): Promise<void> => {
    const data = await userService.searchUsersService(
        getUserId(req),
        req.query,
    );
    sendOk(res, { data });
};

export const getPublicProfileController = async (
    req: Request<UsernameParamInput>,
    res: Response,
): Promise<void> => {
    const data = await userService.getPublicProfileService(req.params);
    sendOk(res, { data });
};

export const deleteAccountController = async (
    req: Request<ParamsDictionary, unknown, DeleteAccountInput>,
    res: Response,
): Promise<void> => {
    await userService.deleteAccountService(getUserId(req), req.body);

    clearAuthCookie(res);
    sendOk(res, { message: "Account deleted successfully" });
};
