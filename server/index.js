const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. GLOBAL MIDDLEWARE FIRST
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));