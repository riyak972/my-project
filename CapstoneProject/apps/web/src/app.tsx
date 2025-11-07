import { Routes, Route, Navigate } from 'react-router-dom';
import { useChatStore } from './lib/store';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { useEffect, useState } from 'react';
import { authApi } from './lib/api';

function App() {
  const { user, setUser } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    authApi
      .me()
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? '/chat' : '/login'} />} />
    </Routes>
  );
}

export default App;


