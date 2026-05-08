const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// POST /api/bookings  — create booking
router.post('/', protect, async (req, res) => {
  const { car_id, driver_id, start_date, end_date, service_ids } = req.body;
  try {
    const pool = await poolPromise;

    // Get customer_id from user_id
    const cust = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT customer_id FROM Customers WHERE user_id=@uid');
    const customer_id = cust.recordset[0]?.customer_id;
    if (!customer_id) return res.status(400).json({ message: 'Customer not found' });

    const result = await pool.request()
      .input('customer_id', sql.Int,     customer_id)
      .input('car_id',      sql.Int,     car_id)
      .input('driver_id',   sql.Int,     driver_id   || null)
      .input('start_date',  sql.Date,    start_date)
      .input('end_date',    sql.Date,    end_date)
      .input('service_ids', sql.VarChar, service_ids || null)
      .execute('sp_CreateBooking');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/bookings/my  — customer's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query(`SELECT b.* FROM vw_BookingDetails b
               JOIN Customers c ON b.customer_name=(
                 SELECT name FROM Users WHERE user_id=@uid)
               ORDER BY b.booking_date DESC`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('booking_id', sql.Int, req.params.id)
      .execute('sp_CancelBooking');
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// PUT /api/bookings/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  const { payment_method, amount_paid } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('booking_id',     sql.Int,     req.params.id)
      .input('payment_method', sql.VarChar, payment_method)
      .input('amount_paid',    sql.Decimal, amount_paid)
      .execute('sp_CompleteBooking');
    res.json({ message: 'Booking completed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;