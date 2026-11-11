import { z } from "zod";
import { UserGender } from "../../user/types/user.enum";

const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

const isValidEmailDomain = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    return ["gmail.com", "yahoo.com", "outlook.com"].includes(domain);
};

export const RegisterUserSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(15, "Username must be at most 15 characters"),

        givenname: z
            .string()
            .trim()
            .min(3, "Givenname must be at least 3 characters")
            .max(15, "Givenname must be at most 15 characters")
            .transform(capitalize),

        surname: z
            .string()
            .trim()
            .min(3, "Surname must be at least 3 characters")
            .max(15, "Surname must be at most 15 characters")
            .transform(capitalize),

        profilePicture: z.string().optional().nullable(),

        birthdate: z
            .string()
            .refine((value) => !isNaN(Date.parse(value)), "Invalid birthdate")
            .transform((value) => new Date(value))
            .refine((date) => {
                const today = new Date();
                let age = today.getFullYear() - date.getFullYear();
                const m = today.getMonth() - date.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < date.getDate()))
                    age--;
                return age >= 0 && age <= 150;
            }, "Invalid birthdate"),

        gender: z.enum(UserGender).default(UserGender.PreferNotToSay),

        phoneNumber: z
            .string()
            .trim()
            .regex(/^9\d{9}$/, "Invalid Philippine phone number"),

        address: z.string().trim().min(1, "Address is required"),

        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .lowercase()
            .refine(isValidEmailDomain, {
                message: "Only Gmail, Yahoo, and Outlook are allowed",
            }),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password must be at most 72 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            ),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const VerifyEmailSchema = z.object({
    token: z
        .string()
        .length(64)
        .regex(/^[a-f0-9]+$/, "Invalid token"),
});

export const ResendVerificationSchema = z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const LoginSchema = z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
});

type RegisterAuthInput = z.infer<typeof RegisterUserSchema>;
export type RegisterData = Omit<RegisterAuthInput, "confirmPassword">;

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
