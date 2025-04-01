const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Создаем таблицу пользователей если она не существует
router.use(async (req, res, next) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    next();
  } catch (error) {
    console.error('Ошибка при создании таблицы пользователей:', error);
    next(error);
  }
});

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { username, email, password } = req.body;
    
    // Проверяем, не существует ли уже пользователь с таким email или username
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (checkResult.rowCount > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email или username уже существует' });
    }
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 8);
    
    // Создаем нового пользователя
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    // Создаем токен
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '7d' });
    
    // Устанавливаем cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      sameSite: 'lax', // для cross-site requests
      secure: process.env.NODE_ENV === 'production' // для HTTPS
    });
    
    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { email, password } = req.body;
    
    // Ищем пользователя
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    
    const user = result.rows[0];
    
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    
    // Создаем токен
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '7d' });
    
    // Устанавливаем cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      sameSite: 'lax', // для cross-site requests
      secure: process.env.NODE_ENV === 'production' // для HTTPS
    });
    
    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
});

// Выход
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Выход выполнен успешно' });
});

// Получить информацию о текущем пользователе
router.get('/user', auth, (req, res) => {
  // Если middleware auth успешно выполнен, req.user будет содержать данные пользователя
  if (req.user && req.user._id !== '000000000000000000000000') {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.json({ user: null });
  }
});

module.exports = router; 