import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING,
};

// Use SSL in production (Vercel usually requires it)
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false, // Often needed for hosted Postgres
  };
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  // In development, use a global variable to prevent multiple pools during hot reload
  if (!(global as any)._postgresPool) {
    (global as any)._postgresPool = new Pool(poolConfig);
  }
  pool = (global as any)._postgresPool;
}

// Shim to support the tagged template literal syntax used in the app
// e.g. db.sql`SELECT * FROM users`
async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // Construct the query string with $1, $2, etc.
  let text = strings[0];
  for (let i = 1; i < strings.length; i++) {
    text += `$${i}` + strings[i];
  }
  
  // Execute the query
  return pool.query(text, values);
}

const db = {
  sql,
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool // Expose pool if needed
};

export default db;
