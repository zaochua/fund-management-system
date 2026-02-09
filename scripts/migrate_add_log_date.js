
import mysql from 'mysql2/promise';

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'fund_db',
  });

  try {
    console.log('Checking fund_logs table...');
    const [columns] = await connection.query('SHOW COLUMNS FROM fund_logs LIKE "log_date"');
    
    if (columns.length === 0) {
      console.log('Adding log_date column...');
      await connection.query('ALTER TABLE fund_logs ADD COLUMN log_date DATE DEFAULT NULL');
      // Update existing records to have log_date = DATE(created_at)
      await connection.query('UPDATE fund_logs SET log_date = DATE(created_at) WHERE log_date IS NULL');
      console.log('Migration successful: log_date added.');
    } else {
      console.log('Column log_date already exists.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
