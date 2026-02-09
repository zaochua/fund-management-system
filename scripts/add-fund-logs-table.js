import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'fund_db'
};

async function addFundLogsTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    const createFundLogsTable = `
      CREATE TABLE IF NOT EXISTS fund_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createFundLogsTable);
    console.log('Table fund_logs created or already exists');

  } catch (error) {
    console.error('Error adding fund_logs table:', error);
  } finally {
    if (connection) await connection.end();
  }
}

addFundLogsTable();
