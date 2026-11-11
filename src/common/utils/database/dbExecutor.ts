import type { PoolClient } from "pg";
import { pool } from "../../../config/database";

export const getExecutor = (client?: PoolClient) => client ?? pool;
