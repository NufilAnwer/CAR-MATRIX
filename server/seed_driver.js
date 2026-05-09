const { poolPromise, sql } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const pool = await poolPromise;
    
    const hash = await bcrypt.hash('Driver123', 10);
    
    // 1. Create User
    const userResult = await pool.request()
      .input('name', sql.VarChar, 'Usman Driver')
      .input('email', sql.VarChar, 'driver@carmatrix.com')
      .input('phone', sql.VarChar, '03331234567')
      .input('cnic', sql.VarChar, '35202-0000000-1')
      .input('hash', sql.VarChar, hash)
      .query(`INSERT INTO Users (name, email, phone, cnic, password_hash, role)
              OUTPUT INSERTED.user_id
              VALUES (@name, @email, @phone, @cnic, @hash, 'Driver')`);
    
    const userId = userResult.recordset[0].user_id;

    // 2. Create Driver
    await pool.request()
      .input('uid', sql.Int, userId)
      .input('name', sql.VarChar, 'Usman Driver')
      .input('phone', sql.VarChar, '03331234567')
      .input('lic', sql.VarChar, 'LHR-D-0001')
      .input('charge', sql.Decimal, 1200)
      .query(`INSERT INTO Drivers (user_id, name, phone, license_number, charge_per_day, availability_status)
              VALUES (@uid, @name, @phone, @lic, @charge, 'Available')`);

    console.log("Sample driver seeded (driver@carmatrix.com / Driver123)");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
