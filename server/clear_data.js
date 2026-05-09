const { poolPromise, sql } = require('./config/db');
const bcrypt = require('bcryptjs');

async function clear() {
  try {
    const pool = await poolPromise;
    
    console.log("Starting data clearance...");

    // Order of deletion to avoid FK conflicts
    await pool.request().query("DELETE FROM Receipts");
    await pool.request().query("DELETE FROM Payments");
    await pool.request().query("DELETE FROM Booking_Services");
    await pool.request().query("DELETE FROM Reviews");
    await pool.request().query("DELETE FROM Driver_Ratings");
    await pool.request().query("DELETE FROM Bookings");
    await pool.request().query("DELETE FROM Driver_Applications");
    await pool.request().query("DELETE FROM Cars");
    await pool.request().query("DELETE FROM Drivers");
    await pool.request().query("DELETE FROM Customers");
    await pool.request().query("DELETE FROM Admins");
    await pool.request().query("DELETE FROM Users");
    
    console.log("All data cleared.");

    // Add back the System Admin so the system is usable
    const hash = await bcrypt.hash('Admin123', 10);
    const result = await pool.request()
      .input('name', sql.VarChar, 'System Admin')
      .input('email', sql.VarChar, 'admin@carmatrix.com')
      .input('phone', sql.VarChar, '03000000000')
      .input('cnic', sql.VarChar, '00000-0000000-0')
      .input('hash', sql.VarChar, hash)
      .query(`INSERT INTO Users (name,email,phone,cnic,password_hash,role)
               OUTPUT INSERTED.user_id
               VALUES (@name,@email,@phone,@cnic,@hash,'Admin')`);

    const adminId = result.recordset[0].user_id;
    await pool.request()
      .input('uid', sql.Int, adminId)
      .query("INSERT INTO Admins (user_id, admin_level) VALUES (@uid, 'SuperAdmin')");

    console.log("System Admin recreated (admin@carmatrix.com / Admin123)");
    process.exit(0);
  } catch (err) {
    console.error("Clearance failed:", err);
    process.exit(1);
  }
}

clear();
