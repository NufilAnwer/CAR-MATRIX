const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/me - Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT u.user_id, u.name, u.email, u.phone, u.cnic, u.role,
               c.driving_license_number, c.license_upload_path
        FROM Users u
        LEFT JOIN Customers c ON u.user_id = c.user_id
        WHERE u.user_id = @user_id
      `);
    
    if (!result.recordset[0]) return res.status(404).json({ message: 'User not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me - Update profile & license info
router.put('/me', protect, async (req, res) => {
  const { name, phone, driving_license_number, license_upload_path } = req.body;
  try {
    const pool = await poolPromise;
    
    // Update Users table
    await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .input('name', sql.VarChar, name)
      .input('phone', sql.VarChar, phone)
      .query('UPDATE Users SET name = @name, phone = @phone WHERE user_id = @user_id');

    // Update Customers table (only for customers)
    if (req.user.role === 'Customer') {
      await pool.request()
        .input('user_id', sql.Int, req.user.user_id)
        .input('license', sql.VarChar, driving_license_number || null)
        .input('path', sql.VarChar, license_upload_path || null)
        .query(`
          UPDATE Customers 
          SET driving_license_number = @license, 
              license_upload_path = @path 
          WHERE user_id = @user_id
        `);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
