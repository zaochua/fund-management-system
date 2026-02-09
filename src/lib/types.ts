import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password?: string;
  role: string;
  created_at: Date;
}

export interface Fund extends RowDataPacket {
  id: number;
  name: string;
  amount: number | string; // MySQL DECIMAL returns string sometimes, or number depending on driver settings
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface FundName extends RowDataPacket {
  id: number;
  name: string;
  created_at: Date;
}

export interface FundLog extends RowDataPacket {
  id: number;
  content: string;
  user_id: number;
  log_date: string;
  created_at: Date;
}

export interface FundInput {
  name: string;
  amount: number;
}

export interface JWTPayload {
  userId: number;
  username: string;
  [key: string]: unknown;
}

export type DbQueryResult<T> = T[] & RowDataPacket[];
export type DbExecuteResult = ResultSetHeader;
