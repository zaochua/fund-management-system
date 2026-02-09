import { createClient } from '@vercel/postgres';

const client = createClient({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

// Ensure we connect only once
if (process.env.NODE_ENV !== 'production') {
    // In development mode, use a global variable so we don't reconnect on every hot reload
    if (!(global as any)._postgresClient) {
        (global as any)._postgresClient = client;
        client.connect();
    }
} else {
    client.connect();
}

const db = process.env.NODE_ENV !== 'production' ? (global as any)._postgresClient : client;

export default db;
