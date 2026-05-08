const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// POST /api/reviews - Leave a review
router.post('/', protect, async (req, res) => {
  const { car_id, rating, review_text } = req.body;
  try {
    const pool = await poolPromise;

    // 1. Get customer_id for the logged-in user
    const customer = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT customer_id FROM Customers WHERE user_id=@uid');
    const customer_id = customer.recordset[0]?.customer_id;
    if (!customer_id) return res.status(403).json({ message: 'Customer access required' });

    // 2. Verify the user has actually rented and completed a booking for this car
    const rented = await pool.request()
      .input('cid', sql.Int, customer_id)
      .input('car', sql.Int, car_id)
      .query(`
        SELECT TOP 1 1 FROM Bookings 
        WHERE customer_id=@cid AND car_id=@car AND booking_status='Completed'
      `);
    
    if (rented.recordset.length === 0) {
      return res.status(403).json({ message: 'You can only review cars you have successfully rented and returned.' });
    }

    // 3. Insert review
    await pool.request()
      .input('cid', sql.Int, customer_id)
      .input('car', sql.Int, car_id)
      .input('rating', sql.Int, rating)
      .input('text', sql.VarChar, review_text)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Reviews WHERE customer_id=@cid AND car_id=@car)
        BEGIN
          INSERT INTO Reviews (customer_id, car_id, rating, review_text)
          VALUES (@cid, @car, @rating, @text)
        END
        ELSE
        BEGIN
          UPDATE Reviews SET rating=@rating, review_text=@text, review_date=GETDATE()
          WHERE customer_id=@cid AND car_id=@car
        END
      `);

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/car/:id - Get reviews for a car
router.get('/car/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT r.*, u.name as customer_name 
        FROM Reviews r
        JOIN Customers c ON r.customer_id = c.customer_id
        JOIN Users u ON c.user_id = u.user_id
        WHERE r.car_id = @id
        ORDER BY r.review_date DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
