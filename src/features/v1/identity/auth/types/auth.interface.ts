export interface IAuth {
    id: string;
    userId: string;
    passwordHash: string;
    isOnline: boolean;
    lastLogin: Date | null;
    lastLogout: Date | null;
    isVerified: boolean;
    unverifiedExpiresAt: Date | null;
    verificationToken: string | null;
    verificationTokenExpiry: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateAuthInput = Pick<
    IAuth,
    | "userId"
    | "passwordHash"
    | "verificationToken"
    | "verificationTokenExpiry"
    | "unverifiedExpiresAt"
>;
