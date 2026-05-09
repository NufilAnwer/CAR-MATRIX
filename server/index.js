const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. GLOBAL MIDDLEWARE FIRST
app.use(cors()); // Permissive for debugging
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. HEALTH CHECK
app.get('/', (req, res) => res.json({ message: 'CarMatrix API running' }));

// 3. ROUTES LAST
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/drivers',  require('./routes/drivers'));
app.use('/api/services', require('./routes/services'));
app.use('/api/cars',     require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/reviews',  require('./routes/reviews'));

// 4. ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));