const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, cnic, password } = req.body;
  try {
    // 1. Validation
    if (!name || !email || !phone || !cnic || !password)
      return res.status(400).json({ message: 'All fields are required' });

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email format' });

    // Phone format (0 + 10 digits)
    const phoneRegex = /^0\d{10}$/;
    if (!phoneRegex.test(phone))
      return res.status(400).json({ message: 'Phone must be 11 digits starting with 0' });

    // Strong Password (8+ chars, 1 uppercase, 1 number)
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(password))
      return res.status(400).json({ message: 'Password must be 8+ chars with 1 uppercase & 1 number' });

    const pool = await poolPromise;

    // Check duplicates
    const check = await pool.request()
      .input('email', sql.VarChar, email)
      .input('cnic',  sql.VarChar, cnic)
      .query('SELECT COUNT(*) AS cnt FROM Users WHERE email=@email OR cnic=@cnic');

    if (check.recordset[0].cnt > 0)
      return res.status(400).json({ message: 'Email or CNIC already registered' });

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('name',    sql.VarChar, name)
      .input('email',   sql.VarChar, email)
      .input('phone',   sql.VarChar, phone)
      .input('cnic',    sql.VarChar, cnic)
      .input('hash',    sql.VarChar, hash)
      .query(`INSERT INTO Users (name,email,phone,cnic,password_hash,role)
               OUTPUT INSERTED.user_id
               VALUES (@name,@email,@phone,@cnic,@hash,'Customer')`);

    const userId = result.recordset[0].user_id;

    await pool.request()
      .input('uid', sql.Int, userId)
      .query('INSERT INTO Customers (user_id) VALUES (@uid)');

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email=@email AND is_active=1');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/driver-apply', async (req, res) => {
  const {
    full_name, email, phone, cnic, password,
    license_number, charge_per_day,
    experience_years, about_me
  } = req.body;
  try {
    const pool = await poolPromise;

    // Check duplicates
    const check = await pool.request()
      .input('email', sql.VarChar, email)
      .input('cnic',  sql.VarChar, cnic)
      .query(`
        SELECT COUNT(*) AS cnt FROM Users
        WHERE email=@email OR cnic=@cnic
        UNION ALL
        SELECT COUNT(*) AS cnt FROM Driver_Applications
        WHERE (email=@email OR cnic=@cnic)
        AND status != 'Rejected'
      `);
    const total = check.recordset.reduce((s,r) => s + r.cnt, 0);
    if (total > 0)
      return res.status(400).json({
        message: 'Email or CNIC already registered'
      });

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('full_name',        sql.VarChar, full_name)
      .input('email',            sql.VarChar, email)
      .input('phone',            sql.VarChar, phone)
      .input('cnic',             sql.VarChar, cnic)
      .input('password_hash',    sql.VarChar, hash)
      .input('license_number',   sql.VarChar, license_number)
      .input('charge_per_day',   sql.Decimal, charge_per_day)
      .input('experience_years', sql.Int,     experience_years || 0)
      .input('about_me',         sql.VarChar, about_me || null)
      .query(`INSERT INTO Driver_Applications
        (full_name,email,phone,cnic,password_hash,
         license_number,charge_per_day,
         experience_years,about_me)
        VALUES
        (@full_name,@email,@phone,@cnic,@password_hash,
         @license_number,@charge_per_day,
         @experience_years,@about_me)`);

    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
