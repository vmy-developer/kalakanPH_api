import { z } from "zod";
import { RegisterUserSchema } from "../../auth/dtos/auth.data.dto";

const {
    username,
    givenname,
    surname,
    gender,
    birthdate,
    phoneNumber,
    address,
    password,
} = RegisterUserSchema.shape;

export const UpdateProfileSchema = z
    .object({
        username,
        givenname,
        surname,
        gender: gender.unwrap(),
        birthdate,
        phoneNumber,
        address,
    })
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const ChangePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Current password is required")
            .max(72),
        newPassword: password,
        confirmNewPassword: z.string(),
    })
    .strict()
    .refine((d) => d.newPassword === d.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
        message: "New password must be different from the current password",
        path: ["newPassword"],
    });

export const SearchUsersSchema = z.object({
    q: z.string().trim().min(2, "Search must be at least 2 characters").max(30),
    limit: z.coerce.number().int().min(1).max(20).default(10),
    offset: z.coerce.number().int().min(0).max(1000).default(0),
});

export const UsernameParamSchema = z.object({
    username: RegisterUserSchema.shape.username,
});

export type UsernameParamInput = z.infer<typeof UsernameParamSchema>;

export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
