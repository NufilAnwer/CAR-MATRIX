const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const dbServer = process.env.DB_SERVER || 'localhost';
const dbName = process.env.DB_NAME || 'carm';
// Use ODBC Driver 17 for SQL Server. Adjust if using a different driver version.
const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${dbServer};Database=${dbName};Trusted_Connection=yes;`;

const config = {
  connectionString: connectionString,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('DB Connection failed:', err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };