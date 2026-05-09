const { poolPromise, sql } = require('./config/db');

async function makeAdmin(email) {
  try {
    const pool = await poolPromise;
    
    // Check if user exists
    const res = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email=@email');
      
    if (res.recordset.length > 0) {
      const user = res.recordset[0];
      
      // Update role
      await pool.request()
        .input('email', sql.VarChar, email)
        .query("UPDATE Users SET role='Admin' WHERE email=@email");
        
      // Ensure they exist in Admins table
      const checkAdmin = await pool.request()
        .input('uid', sql.Int, user.user_id)
        .query('SELECT * FROM Admins WHERE user_id=@uid');
        
      if (checkAdmin.recordset.length === 0) {
        await pool.request()
          .input('uid', sql.Int, user.user_id)
          .query("INSERT INTO Admins (user_id, admin_level) VALUES (@uid, 'SuperAdmin')");
      }
      
      console.log(`Successfully made ${email} an Admin!`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: node makeAdmin.js <email>");
  process.exit(1);
}

makeAdmin(email);
