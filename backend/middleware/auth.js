const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Получаем токен из cookie
    const token = req.cookies.token;
    
    if (!token) {
      // Если нет токена, делаем запрос доступным для неаутентифицированных пользователей
      // Создаем временного пользователя
      console.log('No token found, using guest user');
      req.user = { _id: '000000000000000000000000' }; // Временный ID для гостевого пользователя
      return next();
    }
    
    // Проверяем токен
    const decoded = jwt.verify(token, 'your_jwt_secret');
    console.log('Token verified, decoded:', decoded);
    
    // Проверяем, существует ли пользователь в базе данных
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rowCount === 0) {
      // Если пользователь не найден, используем гостевой режим
      console.log('User not found in database, using guest mode');
      req.user = { _id: '000000000000000000000000' };
      return next();
    }
    
    // Сохраняем пользователя в запросе
    console.log('User found:', result.rows[0]);
    req.user = {
      _id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // В случае ошибки, используем гостевой режим
    req.user = { _id: '000000000000000000000000' };
    next();
  }
};

module.exports = auth; 