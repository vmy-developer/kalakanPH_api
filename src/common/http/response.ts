import type { Response } from "express";

interface Payload {
    message?: string;
    data?: unknown;
}

/** 200 with the standard `{ message?, data? }` envelope. */
export const sendOk = (res: Response, body: Payload = {}): void => {
    res.status(200).json(body);
};

/** 201 with the standard `{ message?, data? }` envelope. */
export const sendCreated = (res: Response, body: Payload = {}): void => {
    res.status(201).json(body);
};
