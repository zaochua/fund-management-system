const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
// Priority: .env.development.local > .env.local > .env
dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Fallback for Vercel's newer local env behavior which might only download .env.local
// but not include POSTGRES_URL if not explicitly pulled or if using a different command
if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.warn('⚠️ POSTGRES_URL or DATABASE_URL not found in environment variables.');
  console.warn('Please ensure you have run "vercel env pull .env.development.local" to get your database credentials.');
}

async function initDb() {
  // Use the standard Postgres URL, not the Prisma accelerate one
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  
  // Use pg client directly to avoid @vercel/postgres edge/websocket behavior in Node scripts
  const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating funds table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS funds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating fund_names table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_names (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating fund_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fund_logs (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        log_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore disconnection errors
    }
  }
}

initDb().catch((err) => {
  console.error('Unhandled error in initDb:', err);
  process.exit(1);
});
