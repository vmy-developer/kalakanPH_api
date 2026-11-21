export interface GoogleIdentity {
    googleId: string;
    email: string;
    givenname: string;
    surname: string;
    picture: string | null;
}

export interface SignupPayload {
    googleId: string;
    email: string;
    givenname: string;
    surname: string;
    picture: string | null;
    purpose: "google-signup";
}
