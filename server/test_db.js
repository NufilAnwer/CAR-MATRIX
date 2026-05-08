const sql = require('mssql/msnodesqlv8');
const connString = 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=carm;Trusted_Connection=yes;';
new sql.ConnectionPool({connectionString: connString}).connect().then(pool => 
  pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'")
    .then(r => {
      console.log(r.recordset);
      process.exit(0);
    })
).catch(e => {
  console.error(e);
  process.exit(1);
});
