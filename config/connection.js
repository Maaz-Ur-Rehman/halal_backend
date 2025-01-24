const mySql2 = require('mysql2/promise');
dotenv = require('dotenv');
dotenv.config();

let pool;

const createPool = async () => {
  if (pool) return pool;

  pool = await mySql2.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  return pool;
};

const getConnectionFromPool = async () => {
  const pool = await createPool();
  try {
    const connection = await pool.getConnection();
    console.log("SQL Connected");
    return connection;
  } catch (err) {
    console.error("Error getting connection from pool:", err);
    throw err;
  }
};

module.exports = { createPool, getConnectionFromPool };
