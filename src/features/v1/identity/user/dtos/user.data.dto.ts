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

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
