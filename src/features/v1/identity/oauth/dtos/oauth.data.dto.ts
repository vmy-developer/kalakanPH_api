import { z } from "zod";
import { RegisterUserSchema } from "../../auth/dtos/auth.data.dto";

const {
    username,
    givenname,
    surname,
    birthdate,
    gender,
    phoneNumber,
    address,
} = RegisterUserSchema.shape;

export const GoogleLoginSchema = z.object({
    idToken: z.string().min(1),
});

export const GoogleRegisterSchema = z.object({
    signupToken: z.string().min(1),
    username,
    birthdate,
    gender,
    phoneNumber,
    address,
    givenname: givenname.optional(),
    surname: surname.optional(),
});

export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>;
export type GoogleRegisterInput = z.infer<typeof GoogleRegisterSchema>;
