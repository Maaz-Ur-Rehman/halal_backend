const mySql2 = require('mysql2/promise');

let pool;

const createPool = async () => {
  if (pool) return pool;

 
   pool = await mySql2.createPool({
    

    connectionLimit: 10, 
    host: "93.127.192.89",
  port:"3306",
  user:"matzsolu_halal_Scan_Backend",
    password:")f-Rhc+pv[HP",
    database:"matzsolu_hallal_Scan_Backend"



  });
  

  return pool;
};

const getConnectionFromPool = async () => {
  const pool = await createPool();
  try {
    const connection = await pool.getConnection();
    console.log("Sql Connected");
    return connection;
  } catch (err) {
    console.error("Error getting connection from pool:", err);
    throw err;
  }
};

module.exports = { createPool, getConnectionFromPool };
