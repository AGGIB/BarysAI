const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Получить сообщения чата
router.get('/messages/:chatId', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.user._id.toString();
    
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
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
      [req.params.chatId]
    );
    
    // Преобразуем результаты в нужный формат
    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      sender: row.sender,
      text: row.text,
      timestamp: row.timestamp
    }));
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Сохранить новое сообщение
router.post('/messages', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { chatId, sender, text, timestamp } = req.body;
    const userId = req.user._id.toString();
    
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
      'INSERT INTO messages (chat_id, user_id, sender, text, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chatId, userId, sender, text, timestamp || new Date()]
    );
    
    const message = {
      id: result.rows[0].id,
      sender: result.rows[0].sender,
      text: result.rows[0].text,
      timestamp: result.rows[0].timestamp
    };
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Ошибка при сохранении сообщения' });
  }
});

module.exports = router; 