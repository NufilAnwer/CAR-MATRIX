const { poolPromise, sql } = require('./config/db');
const bcrypt = require('bcryptjs');

async function fix() {
  try {
    const pool = await poolPromise;
    const hash = await bcrypt.hash('Zaoromon@1', 10);
    
    // Check if user exists
    const res = await pool.request()
      .input('email', sql.VarChar, 'z@gmail.com')
      .query('SELECT * FROM Users WHERE email=@email');
      
    if (res.recordset.length > 0) {
      const user = res.recordset[0];
      await pool.request()
        .input('email', sql.VarChar, 'z@gmail.com')
        .input('hash', sql.VarChar, hash)
        .query("UPDATE Users SET password_hash=@hash, role='Admin', is_active=1 WHERE email=@email");
        
      const checkAdmin = await pool.request()
        .input('uid', sql.Int, user.user_id)
        .query('SELECT * FROM Admins WHERE user_id=@uid');
        
      if (checkAdmin.recordset.length === 0) {
        await pool.request()
          .input('uid', sql.Int, user.user_id)
          .query("INSERT INTO Admins (user_id, admin_level) VALUES (@uid, 'SuperAdmin')");
      }
      console.log('Fixed existing user.');
    } else {
      const insertUser = await pool.request()
          .input('name', sql.VarChar, 'Super Admin Z')
          .input('email', sql.VarChar, 'z@gmail.com')
          .input('phone', sql.VarChar, '03001234567')
          .input('cnic', sql.VarChar, '35202-1234567-9')
          .input('hash', sql.VarChar, hash)
          .query(`INSERT INTO Users (name,email,phone,cnic,password_hash,role)
                   OUTPUT INSERTED.user_id
                   VALUES (@name,@email,@phone,@cnic,@hash,'Admin')`);
                   
      const newUserId = insertUser.recordset[0].user_id;
      
      await pool.request()
        .input('uid', sql.Int, newUserId)
        .query("INSERT INTO Admins (user_id, admin_level) VALUES (@uid, 'SuperAdmin')");
      console.log('Created new user.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fix();
