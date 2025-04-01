const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/message');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'barysai',
  password: 'postgres',
  port: 5432,
});

// Проверяем соединение с PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Ошибка соединения с PostgreSQL:', err);
  } else {
    console.log('Соединение с PostgreSQL установлено:', res.rows[0]);
  }
});

// Делаем pool доступным через req.app.locals.pool
app.locals.pool = pool;

// Routes
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
app.use('/api', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 