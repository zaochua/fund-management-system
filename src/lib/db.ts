import { createClient, sql } from '@vercel/postgres';

let db: any;

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), use the default pooled 'sql' client.
  // It handles connection pooling and serverless lifecycle automatically.
  // We map 'sql' to a property to maintain compatibility with the 'client.sql' syntax used in development.
  db = { sql };
} else {
  // In development, use a persistent client connection.
  // This avoids "too many connections" errors during hot reloads
  // and supports direct connection strings often used locally.
  if (!(global as any)._postgresClient) {
    const client = createClient({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    });
    client.connect();
    (global as any)._postgresClient = client;
  }
  db = (global as any)._postgresClient;
}

export default db;
