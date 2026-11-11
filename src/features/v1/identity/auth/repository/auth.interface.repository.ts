import type { PoolClient } from "pg";
import type { IAuth, CreateAuthInput } from "../types/auth.interface";

export interface IAuthRepository {
    create(data: CreateAuthInput, client?: PoolClient): Promise<IAuth>;

    deleteExpiredUnverified(client?: PoolClient): Promise<string[]>;
}
