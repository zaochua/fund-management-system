import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'fund_db'
};

async function addFundNamesTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    const createFundNamesTable = `
      CREATE TABLE IF NOT EXISTS fund_names (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createFundNamesTable);
    console.log('Table fund_names created or already exists');

  } catch (error) {
    console.error('Error adding fund_names table:', error);
  } finally {
    if (connection) await connection.end();
  }
}

addFundNamesTable();
