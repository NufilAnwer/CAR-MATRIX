const express = require('express');
const router  = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes below require login AND admin role
router.use(protect, adminOnly);

// ============================================================
//  DASHBOARD STATS
// ============================================================

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Bookings)
          AS total_bookings,
        (SELECT ISNULL(SUM(total_amount), 0)
         FROM Bookings WHERE booking_status = 'Completed')
          AS total_revenue,
        (SELECT COUNT(*) FROM Cars c
         JOIN Car_Status cs ON c.status_id = cs.status_id
         WHERE cs.status_name = 'Available')
          AS active_cars,
        (SELECT COUNT(*) FROM Customers)
          AS total_customers
    `);
    res.json(r.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
//  BOOKINGS
// ============================================================

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const pool = await poolPromise;
    const limit = parseInt(req.query.limit) || 200;
    const r = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) *
        FROM vw_BookingDetails
        ORDER BY booking_date DESC
      `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/bookings/:id/complete
router.put('/bookings/:id/complete', async (req, res) => {
  const { payment_method, amount_paid } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('booking_id',     sql.Int,     req.params.id)
      .input('payment_method', sql.VarChar, payment_method)
      .input('amount_paid',    sql.Decimal, amount_paid)
      .execute('sp_CompleteBooking');
    res.json({ message: 'Booking completed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ============================================================
//  CARS
// ============================================================

// GET /api/admin/cars
router.get('/cars', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT c.*, cc.category_name, cs.status_name, d.name AS driver_name
      FROM Cars c
      JOIN Car_Categories cc ON c.category_id = cc.category_id
      JOIN Car_Status cs     ON c.status_id   = cs.status_id
      LEFT JOIN Drivers d    ON c.driver_id   = d.driver_id
      ORDER BY c.car_id DESC
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/cars
router.post('/cars', async (req, res) => {
  const {
    brand, model, year, category_id,
    transmission_type, fuel_type,
    price_per_day, seating_capacity,
    description, image_url, driver_id
  } = req.body;
  try {
    const pool = await poolPromise;

    // Get admin_id from logged-in user
    const adminR = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT admin_id FROM Admins WHERE user_id = @uid');
    const admin_id = adminR.recordset[0]?.admin_id;
    if (!admin_id)
      return res.status(403).json({ message: 'Admin record not found' });

    // Get default Available status id
    const statusR = await pool.request()
      .query(`SELECT status_id FROM Car_Status WHERE status_name = 'Available'`);
    const status_id = statusR.recordset[0]?.status_id;

    await pool.request()
      .input('category_id',       sql.Int,     category_id)
      .input('status_id',         sql.Int,     status_id)
      .input('admin_id',          sql.Int,     admin_id)
      .input('brand',             sql.VarChar, brand)
      .input('model',             sql.VarChar, model)
      .input('year',              sql.Int,     year)
      .input('transmission_type', sql.VarChar, transmission_type)
      .input('fuel_type',         sql.VarChar, fuel_type)
      .input('price_per_day',     sql.Decimal, price_per_day)
      .input('seating_capacity',  sql.Int,     seating_capacity)
      .input('description',       sql.VarChar, description || null)
      .input('image_url',         sql.VarChar, image_url   || null)
      .input('driver_id',         sql.Int,     driver_id   || null)
      .query(`
        INSERT INTO Cars
          (category_id, status_id, admin_id, brand, model, year,
           transmission_type, fuel_type, price_per_day,
           seating_capacity, description, image_url, driver_id)
        VALUES
          (@category_id, @status_id, @admin_id, @brand, @model, @year,
           @transmission_type, @fuel_type, @price_per_day,
           @seating_capacity, @description, @image_url, @driver_id)
      `);
    res.status(201).json({ message: 'Car added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/cars/:id (Update full car details)
router.put('/cars/:id', async (req, res) => {
  const {
    brand, model, year, category_id,
    transmission_type, fuel_type,
    price_per_day, seating_capacity,
    description, image_url, driver_id
  } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('car_id',            sql.Int,     req.params.id)
      .input('category_id',       sql.Int,     category_id)
      .input('brand',             sql.VarChar, brand)
      .input('model',             sql.VarChar, model)
      .input('year',              sql.Int,     year)
      .input('transmission_type', sql.VarChar, transmission_type)
      .input('fuel_type',         sql.VarChar, fuel_type)
      .input('price_per_day',     sql.Decimal, price_per_day)
      .input('seating_capacity',  sql.Int,     seating_capacity)
      .input('description',       sql.VarChar, description || null)
      .input('image_url',         sql.VarChar, image_url   || null)
      .input('driver_id',         sql.Int,     driver_id   || null)
      .query(`
        UPDATE Cars
        SET category_id = @category_id,
            brand = @brand,
            model = @model,
            year = @year,
            transmission_type = @transmission_type,
            fuel_type = @fuel_type,
            price_per_day = @price_per_day,
            seating_capacity = @seating_capacity,
            description = @description,
            image_url = @image_url,
            driver_id = @driver_id
        WHERE car_id = @car_id
      `);
    res.json({ message: 'Car details updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/cars/:id/status
router.patch('/cars/:id/status', async (req, res) => {
  const { status_name } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('car_id',      sql.Int,     req.params.id)
      .input('status_name', sql.VarChar, status_name)
      .query(`
        UPDATE Cars
        SET status_id = (
          SELECT status_id FROM Car_Status
          WHERE status_name = @status_name
        )
        WHERE car_id = @car_id
      `);
    res.json({ message: 'Car status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/cars/:id
router.delete('/cars/:id', async (req, res) => {
  try {
    const pool = await poolPromise;

    // Block delete if active bookings exist
    const check = await pool.request()
      .input('car_id', sql.Int, req.params.id)
      .query(`
        SELECT COUNT(*) AS cnt FROM Bookings
        WHERE car_id = @car_id
        AND booking_status IN ('Confirmed', 'Pending')
      `);
    if (check.recordset[0].cnt > 0)
      return res.status(400).json({
        message: 'Cannot remove — car has active bookings'
      });

    await pool.request()
      .input('car_id', sql.Int, req.params.id)
      .query('DELETE FROM Cars WHERE car_id = @car_id');

    res.json({ message: 'Car removed from fleet' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
//  CUSTOMERS
// ============================================================

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT
        u.user_id, u.name, u.email, u.phone,
        u.cnic, u.registration_date, u.is_active,
        c.student_status,
        (SELECT COUNT(*)
         FROM Bookings b
         JOIN Customers cu ON b.customer_id = cu.customer_id
         WHERE cu.user_id = u.user_id) AS booking_count
      FROM Users u
      JOIN Customers c ON u.user_id = c.user_id
      ORDER BY u.registration_date DESC
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
  const { is_active } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('uid',       sql.Int, req.params.id)
      .input('is_active', sql.Bit, is_active ? 1 : 0)
      .query('UPDATE Users SET is_active = @is_active WHERE user_id = @uid');
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
//  DRIVERS
// ============================================================

// GET /api/admin/drivers
router.get('/drivers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT * FROM Drivers ORDER BY driver_id DESC
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/drivers  (admin manually adds a driver)
router.post('/drivers', async (req, res) => {
  const { name, phone, license_number, charge_per_day } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('name',           sql.VarChar, name)
      .input('phone',          sql.VarChar, phone)
      .input('license_number', sql.VarChar, license_number)
      .input('charge_per_day', sql.Decimal, charge_per_day)
      .query(`
        INSERT INTO Drivers (name, phone, license_number, charge_per_day)
        VALUES (@name, @phone, @license_number, @charge_per_day)
      `);
    res.status(201).json({ message: 'Driver added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/drivers/:id/status
router.patch('/drivers/:id/status', async (req, res) => {
  const { availability_status } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('driver_id',          sql.Int,     req.params.id)
      .input('availability_status',sql.VarChar, availability_status)
      .query(`
        UPDATE Drivers
        SET availability_status = @availability_status
        WHERE driver_id = @driver_id
      `);
    res.json({ message: 'Driver status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
//  DRIVER APPLICATIONS  (new — from driver registration feature)
// ============================================================

// GET /api/admin/driver-applications
router.get('/driver-applications', async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().query(`
      SELECT * FROM Driver_Applications
      ORDER BY
        CASE status
          WHEN 'Pending'  THEN 0
          WHEN 'Approved' THEN 1
          ELSE 2
        END,
        applied_at DESC
    `);
    res.json(r.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/driver-applications/:id/approve
router.post('/driver-applications/:id/approve', async (req, res) => {
  try {
    const pool = await poolPromise;

    const adminR = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT admin_id FROM Admins WHERE user_id = @uid');
    const admin_id = adminR.recordset[0]?.admin_id;
    if (!admin_id)
      return res.status(403).json({ message: 'Admin record not found' });

    const result = await pool.request()
      .input('application_id', sql.Int, req.params.id)
      .input('admin_id',       sql.Int, admin_id)
      .execute('sp_ApproveDriverApplication');

    res.json({
      message: 'Driver approved and account created!',
      ...result.recordset[0]
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/admin/driver-applications/:id/reject
router.post('/driver-applications/:id/reject', async (req, res) => {
  const { reason } = req.body;
  try {
    const pool = await poolPromise;

    const adminR = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT admin_id FROM Admins WHERE user_id = @uid');
    const admin_id = adminR.recordset[0]?.admin_id;
    if (!admin_id)
      return res.status(403).json({ message: 'Admin record not found' });

    await pool.request()
      .input('application_id', sql.Int,     req.params.id)
      .input('admin_id',       sql.Int,     admin_id)
      .input('reason',         sql.VarChar, reason || null)
      .execute('sp_RejectDriverApplication');

    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ============================================================
//  REVENUE REPORT
// ============================================================

// GET /api/admin/revenue?from_date=&to_date=
router.get('/revenue', async (req, res) => {
  const { from_date, to_date } = req.query;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('from_date', sql.Date, from_date || null)
      .input('to_date',   sql.Date, to_date   || null)
      .execute('sp_RevenueReport');

    res.json({
      summary:     result.recordsets[0]?.[0] || null,
      by_category: result.recordsets[1]      || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;