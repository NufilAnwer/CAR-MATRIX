const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// GET /api/cars/search?start=&end=&category=&transmission=&fuel=&maxPrice=&minSeats=
router.get('/search', async (req, res) => {
  const { start, end, category, transmission, fuel, minPrice, maxPrice, minSeats } = req.query;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('start_date',  sql.Date, start  || null)
      .input('end_date',    sql.Date, end    || null)
      .input('category_id', sql.Int,  category    || null)
      .input('transmission',sql.VarChar, transmission || null)
      .input('fuel_type',   sql.VarChar, fuel        || null)
      .input('min_price',   sql.Decimal, minPrice    || null)
      .input('max_price',   sql.Decimal, maxPrice    || null)
      .input('min_seats',   sql.Int,     minSeats    || null)
      .execute('sp_SearchAvailableCars');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cars/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('car_id', sql.Int, req.params.id)
      .query(`SELECT c.*, cc.category_name, cs.status_name
               FROM Cars c
               JOIN Car_Categories cc ON c.category_id=cc.category_id
               JOIN Car_Status cs ON c.status_id=cs.status_id
               WHERE c.car_id=@car_id`);
    if (!result.recordset[0]) return res.status(404).json({ message: 'Car not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;