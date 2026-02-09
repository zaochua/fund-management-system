import { QueryResultRow } from '@vercel/postgres';

export interface User extends QueryResultRow {
  id: number;
  username: string;
  password?: string;
  role: string;
  created_at: Date;
}

export interface Fund extends QueryResultRow {
  id: number;
  name: string;
  amount: number | string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface FundName extends QueryResultRow {
  id: number;
  name: string;
  sector?: string;
  created_at: Date;
}

export interface FundLog extends QueryResultRow {
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

// Helper types for migration compatibility
// In Vercel Postgres (pg), query returns { rows: T[], rowCount: number, ... }
export type DbQueryResult<T> = T[];

// For insert/update/delete results
export interface DbExecuteResult {
  rowCount: number;
  rows: any[];
}
