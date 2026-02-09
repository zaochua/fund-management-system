const mysql = require('mysql2/promise');
const dbConfig = require('./db-config.js');

async function initDb() {
  let connection;
  try {
    // Connect without database selected to create it if needed
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database ${dbConfig.database} created or already exists`);

    // Use database
    await connection.changeUser({ database: dbConfig.database });

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUsersTable);
    console.log('Table users created or already exists');

    // Create funds table
    const createFundsTable = `
      CREATE TABLE IF NOT EXISTS funds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createFundsTable);
    console.log('Table funds created or already exists');
    
    // Insert a test user if not exists (password: 123456)
    // Note: In production, password should be hashed. Here we store plain text or simple hash for demo if bcrypt not used in script.
    // For simplicity in this init script, I will insert a raw user, but app should handle hashing.
    // Let's just create table structure.

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
