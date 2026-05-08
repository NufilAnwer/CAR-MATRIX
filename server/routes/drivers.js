
const express = require('express');
const router  = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// GET /api/drivers/available — public, for booking form
router.get('/available', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT d.driver_id, d.name, d.phone,
             d.license_number, d.charge_per_day,
             d.availability_status,
             ISNULL(AVG(CAST(dr.rating AS FLOAT)),0)
               AS avg_rating,
             COUNT(dr.rating_id) AS total_ratings
      FROM Drivers d
      LEFT JOIN Driver_Ratings dr
             ON d.driver_id = dr.driver_id
      WHERE d.availability_status = 'Available'
      GROUP BY d.driver_id, d.name, d.phone,
               d.license_number, d.charge_per_day,
               d.availability_status
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/drivers/me — logged-in driver's profile
router.get('/me', protect, async (req, res) => {
  if (req.user.role !== 'Driver')
    return res.status(403).json({ message: 'Driver only' });
  try {
    const pool = await poolPromise;
    const r = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query(`SELECT * FROM vw_DriverDashboard
               WHERE user_id = @uid`);
    if (!r.recordset[0])
      return res.status(404).json({ message: 'Not found' });
    res.json(r.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/drivers/me/trips — driver's assigned trips
router.get('/me/trips', protect, async (req, res) => {
  if (req.user.role !== 'Driver')
    return res.status(403).json({ message: 'Driver only' });
  try {
    const pool = await poolPromise;
    const r = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        SELECT b.booking_id, b.start_date, b.end_date,
               b.total_amount, b.base_price,
               b.booking_status,
               u.name AS customer_name,
               CONCAT(c.brand,' ',c.model,
                      ' (',c.year,')') AS car_name,
               d.driver_id
        FROM Bookings b
        JOIN Drivers d    ON b.driver_id   = d.driver_id
        JOIN Customers cu ON b.customer_id = cu.customer_id
        JOIN Users u      ON cu.user_id    = u.user_id
        JOIN Cars c       ON b.car_id      = c.car_id
        WHERE d.user_id = @uid
        ORDER BY b.start_date DESC
      `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/drivers/me/status
router.patch('/me/status', protect, async (req, res) => {
  if (req.user.role !== 'Driver')
    return res.status(403).json({ message: 'Driver only' });
  const { availability_status } = req.body;
  const allowed = ['Available','On Trip','Inactive'];
  if (!allowed.includes(availability_status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('uid',    sql.Int,     req.user.user_id)
      .input('status', sql.VarChar, availability_status)
      .query(`UPDATE Drivers
               SET availability_status=@status
               WHERE user_id=@uid`);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;