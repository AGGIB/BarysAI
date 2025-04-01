const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Создаем PostgreSQL таблицы если они не существуют
router.use(async (req, res, next) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        sender VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаем индекс для быстрого поиска по chat_id
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
    `);
    
    next();
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error);
    next(error);
  }
});

// Получить все чаты пользователя
router.get('/chats', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.user._id.toString();
    
    const result = await pool.query(
      'SELECT * FROM chats WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    
    // Преобразуем результаты в нужный формат
    const chats = result.rows.map(row => ({
      id: row.chat_id,
      title: row.title,
      timestamp: row.timestamp
    }));
    
    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Ошибка при получении списка чатов' });
  }
});

// Создать новый чат
router.post('/chats', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { chatId, title, timestamp } = req.body;
    const userId = req.user._id.toString();
    
    console.log('POST /chats - Received request:', JSON.stringify(req.body));
    console.log('User ID:', userId);
    
    const result = await pool.query(
      'INSERT INTO chats (chat_id, user_id, title, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [chatId, userId, title, timestamp || new Date()]
    );
    
    const chat = {
      id: result.rows[0].chat_id,
      title: result.rows[0].title,
      timestamp: result.rows[0].timestamp
    };
    
    console.log('Chat created successfully:', chat);
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Ошибка при создании чата', error: error.message });
  }
});

// Обновить название чата
router.put('/chats/:chatId', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { title } = req.body;
    const userId = req.user._id.toString();
    
    const result = await pool.query(
      'UPDATE chats SET title = $1 WHERE chat_id = $2 AND user_id = $3 RETURNING *',
      [title, req.params.chatId, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    
    const chat = {
      id: result.rows[0].chat_id,
      title: result.rows[0].title,
      timestamp: result.rows[0].timestamp
    };
    
    res.json({ chat });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Ошибка при обновлении чата' });
  }
});

// Удалить чат и все его сообщения
router.delete('/chats/:chatId', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.user._id.toString();
    
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

module.exports = router; 