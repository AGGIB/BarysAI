import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AnimatedLoader from '../components/AnimatedLoader';

function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Проверяем, имеем ли мы доступ к API админа
          const adminCheckResponse = await fetch('http://localhost:5001/api/admin/stats', {
            credentials: 'include'
          });
          
          setIsAdmin(adminCheckResponse.ok);
          
          if (adminCheckResponse.ok) {
            fetchAdminData();
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Failed to verify admin access');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Получаем общую статистику
      const statsResponse = await fetch('http://localhost:5001/api/admin/stats', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // Получаем список пользователей
      const usersResponse = await fetch('http://localhost:5001/api/admin/users', {
        credentials: 'include'
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
      
      // Получаем данные для графика регистраций
      const registrationsResponse = await fetch('http://localhost:5001/api/admin/registrations', {
        credentials: 'include'
      });
      
      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData.registrations);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Redirect to admin login page after logout
        window.location.href = '/admin-login';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Ошибка при выходе из системы');
    }
  };
  
  const handleRefresh = () => {
    fetchAdminData();
  };
  
  // Если не админ, перенаправляем на главную
  if (!loading && !isAdmin) {
    return <Navigate to="/admin-login" />;
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AnimatedLoader />
      </div>
    );
  }
  
  if (error && !refreshing) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4 pt-12">
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-100 text-blue-700 py-2 text-center z-50">
          Обновление данных...
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Обновление...
              </>
            ) : (
              'Обновить'
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Выйти
          </button>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-gray-500 text-sm">Всего пользователей</h2>
          <p className="text-2xl font-bold">{stats?.userCount || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-gray-500 text-sm">Всего запросов</h2>
          <p className="text-2xl font-bold">{stats?.queryCount || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-gray-500 text-sm">Запросы за 30 дней</h2>
          <p className="text-2xl font-bold">{stats?.recentQueries || 0}</p>
        </div>
      </div>
      
      {/* Таблица пользователей */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Список пользователей</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Имя</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Дата регистрации</th>
                <th className="py-2 px-4 text-left">Чатов</th>
                <th className="py-2 px-4 text-left">Сообщений</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.first_name} {user.last_name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{user.chat_count}</td>
                  <td className="py-2 px-4">{user.message_count}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-4 text-center">Нет пользователей</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Таблица с популярными запросами */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Популярные запросы</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Запрос</th>
                <th className="py-2 px-4 text-left">Количество</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topQueries?.map((query, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{query.query_text}</td>
                  <td className="py-2 px-4">{query.query_count}</td>
                </tr>
              ))}
              {(!stats?.topQueries || stats.topQueries.length === 0) && (
                <tr>
                  <td colSpan="2" className="py-4 text-center">Нет данных о запросах</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel; 