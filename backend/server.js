const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { validationResult, check } = require('express-validator');
const pool = require('./db');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'barys-ai-secret-key';

// Auth middleware for protected routes
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Промежуточное ПО для проверки прав администратора
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rowCount === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Routes

// Register a new user
app.post('/api/register', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
      [firstName, lastName, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // secure: true, // Enable in production with HTTPS
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        email: newUser.rows[0].email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
app.post('/api/login', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // secure: true, // Enable in production with HTTPS
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user info (protected route)
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Создаем таблицы для пользователей, чатов и сообщений
app.use(async (req, res, next) => {
  try {
    // Добавляем поле role в таблицу users, если она уже существует
    const checkUserTable = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (checkUserTable.rowCount === 0) {
      // Добавляем поле role, если его нет
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'user'
      `);
      
      // Устанавливаем первого пользователя как администратора
      await pool.query(`
        UPDATE users SET role = 'admin' WHERE id = 1
      `);
    }
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL,
        user_id INTEGER NOT NULL,
        sender VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаем таблицу для статистики запросов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS query_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        query_text TEXT NOT NULL,
        chat_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаем индексы для быстрого поиска
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
      CREATE INDEX IF NOT EXISTS idx_query_stats_user_id ON query_stats (user_id);
    `);
    
    next();
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error);
    next();
  }
});

// Получить все чаты пользователя
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('GET /api/chats - Fetching chats for user:', userId);
    
    const result = await pool.query(
      'SELECT chat_id, title, created_at FROM chats WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const chats = result.rows.map(row => ({
      id: row.chat_id,
      title: row.title,
      timestamp: row.created_at
    }));
    
    console.log('Sending chats to client:', JSON.stringify(chats, null, 2));
    
    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Ошибка при получении списка чатов' });
  }
});

// Создать новый чат
app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { chatId, title, timestamp } = req.body;
    const userId = req.user.id;
    
    console.log('POST /api/chats - Received request:', JSON.stringify(req.body));
    console.log('User ID:', userId);
    
    const result = await pool.query(
      'INSERT INTO chats (chat_id, user_id, title, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [chatId, userId, title, timestamp || new Date()]
    );
    
    const chat = {
      id: result.rows[0].chat_id,
      title: result.rows[0].title,
      timestamp: result.rows[0].created_at
    };
    
    console.log('Chat created successfully:', chat);
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Ошибка при создании чата', error: error.message });
  }
});

// Гостевой режим для неаутентифицированных пользователей
app.post('/api/guest/chats', async (req, res) => {
  try {
    const { chatId, title, timestamp } = req.body;
    
    console.log('POST /api/guest/chats - Received request (guest mode):', JSON.stringify(req.body));
    
    // Для гостевого режима просто возвращаем успешный ответ без сохранения в БД
    const chat = {
      id: chatId,
      title: title,
      timestamp: timestamp || new Date()
    };
    
    console.log('Guest chat created successfully:', chat);
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Error creating guest chat:', error);
    res.status(500).json({ message: 'Ошибка при создании чата', error: error.message });
  }
});

// Обновить название чата
app.put('/api/chats/:chatId/update-title', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;
    
    console.log(`PUT /api/chats/${chatId}/update-title - Updating chat title:`, title);
    
    // Проверяем, что чат принадлежит пользователю
    const chatCheck = await pool.query(
      'SELECT * FROM chats WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );
    
    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Чат не найден или не принадлежит пользователю' });
    }
    
    // Обновляем название чата
    const result = await pool.query(
      'UPDATE chats SET title = $1 WHERE chat_id = $2 AND user_id = $3 RETURNING chat_id, title, created_at',
      [title, chatId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Не удалось обновить название чата' });
    }
    
    const updatedChat = {
      id: result.rows[0].chat_id,
      title: result.rows[0].title,
      timestamp: result.rows[0].created_at
    };
    
    console.log('Chat title updated successfully:', updatedChat);
    res.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: 'Ошибка при обновлении названия чата' });
  }
});

// Удалить чат и все его сообщения
app.delete('/api/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Начинаем транзакцию
    await pool.query('BEGIN');
    
    // Удаляем чат
    const chatResult = await pool.query(
      'DELETE FROM chats WHERE chat_id = $1 AND user_id = $2 RETURNING *',
      [req.params.chatId, userId]
    );
    
    if (chatResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Чат не найден' });
    }
    
    // Удаляем все сообщения чата
    await pool.query(
      'DELETE FROM messages WHERE chat_id = $1',
      [req.params.chatId]
    );
    
    // Завершаем транзакцию
    await pool.query('COMMIT');
    
    res.json({ message: 'Чат успешно удален' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Ошибка при удалении чата' });
  }
});

// Получить сообщения чата
app.get('/api/messages/:chatId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Проверяем, что чат принадлежит пользователю
    const chatResult = await pool.query(
      'SELECT * FROM chats WHERE chat_id = $1 AND user_id = $2',
      [req.params.chatId, userId]
    );
    
    if (chatResult.rowCount === 0) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    
    // Получаем сообщения чата
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [req.params.chatId]
    );
    
    // Преобразуем результаты в нужный формат
    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      sender: row.sender,
      text: row.text,
      timestamp: row.created_at
    }));
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Сохранить новое сообщение
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId, sender, text, timestamp } = req.body;
    const userId = req.user.id;
    
    // Проверяем, что чат принадлежит пользователю
    const chatResult = await pool.query(
      'SELECT * FROM chats WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );
    
    if (chatResult.rowCount === 0) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    
    // Сохраняем сообщение
    const result = await pool.query(
      'INSERT INTO messages (chat_id, user_id, sender, text, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chatId, userId, sender, text, timestamp || new Date()]
    );
    
    // Если сообщение от пользователя, сохраняем для статистики
    if (sender === 'user') {
      try {
        await pool.query(
          'INSERT INTO query_stats (user_id, query_text, chat_id) VALUES ($1, $2, $3)',
          [userId, text, chatId]
        );
      } catch (err) {
        console.error('Ошибка при сохранении статистики:', err);
      }
    }
    
    const message = {
      id: result.rows[0].id,
      sender: result.rows[0].sender,
      text: result.rows[0].text,
      timestamp: result.rows[0].created_at
    };
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Ошибка при сохранении сообщения' });
  }
});

// Гостевой режим для сообщений
app.post('/api/guest/messages', async (req, res) => {
  try {
    const { chatId, sender, text, timestamp } = req.body;
    
    // Для гостевого режима просто возвращаем успешный ответ без сохранения в БД
    const message = {
      id: Date.now(),
      sender,
      text,
      timestamp: timestamp || new Date()
    };
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error with guest message:', error);
    res.status(500).json({ message: 'Ошибка при обработке сообщения' });
  }
});

// ADMIN PANEL API

// Получение общей статистики
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Общее количество пользователей
    const userCountResult = await pool.query(`
      SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'
    `);
    
    // Количество запросов
    const queryCountResult = await pool.query(`
      SELECT COUNT(*) AS total_queries FROM query_stats
    `);
    
    // Запросы за последние 30 дней
    const recentQueriesResult = await pool.query(`
      SELECT COUNT(*) AS recent_queries 
      FROM query_stats 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    // Топ-10 запросов
    const topQueriesResult = await pool.query(`
      SELECT query_text, COUNT(*) AS query_count 
      FROM query_stats 
      GROUP BY query_text 
      ORDER BY query_count DESC 
      LIMIT 10
    `);
    
    res.json({
      userCount: parseInt(userCountResult.rows[0].total_users),
      queryCount: parseInt(queryCountResult.rows[0].total_queries),
      recentQueries: parseInt(recentQueriesResult.rows[0].recent_queries),
      topQueries: topQueriesResult.rows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Получение списка пользователей с активностью
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.first_name,
        u.last_name,
        u.email, 
        u.created_at,
        COUNT(DISTINCT c.chat_id) AS chat_count,
        COUNT(m.id) AS message_count
      FROM users u
      LEFT JOIN chats c ON u.id = c.user_id
      LEFT JOIN messages m ON c.chat_id = m.chat_id AND u.id = m.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Графики регистраций по дням
app.get('/api/admin/registrations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days' AND role = 'user'
      GROUP BY DATE(created_at) 
      ORDER BY date
    `);
    
    res.json({ registrations: result.rows });
  } catch (error) {
    console.error('Error fetching registrations chart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // For admin login, we use username instead of email
    if (username !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if admin user exists
    const adminResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      ['admin', 'admin']
    );
    
    // If admin doesn't exist yet, create it
    if (adminResult.rows.length === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role, username) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin', 'User', 'admin@barysai.kz', hashedPassword, 'admin', 'admin']
      );
    }
    
    // Get admin user (either existing or newly created)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      ['admin', 'admin']
    );
    
    if (userResult.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to create admin user' });
    }
    
    const user = userResult.rows[0];
    
    // For the existing admin, verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token with admin role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    res.json({
      message: 'Admin login successful',
      user: {
        id: user.id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// Ensure admin user exists and username field is added
app.use(async (req, res, next) => {
  try {
    // Check if username column exists
    const checkUsernameColumn = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    `);
    
    if (checkUsernameColumn.rowCount === 0) {
      // Add username column
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE
      `);
    }
    
    // Check if admin exists and create if not
    const adminExists = await pool.query(
      'SELECT * FROM users WHERE role = $1 AND username = $2',
      ['admin', 'admin']
    );
    
    if (adminExists.rowCount === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role, username) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        ['Admin', 'User', 'admin@barysai.kz', hashedPassword, 'admin', 'admin']
      );
      
      console.log('Admin user created');
    }
    
    next();
  } catch (error) {
    console.error('Error setting up admin:', error);
    next();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
