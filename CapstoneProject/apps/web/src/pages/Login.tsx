import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../lib/store';
import { authApi } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPassword = password.trim();
    if (!isLogin) {
      if (trimmedPassword.length < 6 || trimmedPassword.length > 64) {
        setError('Password must be 6–64 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      console.log('Attempting', isLogin ? 'login' : 'register', 'with:', {
        email: email.trim(),
        passwordLength: trimmedPassword.length
      });
      
      const data = isLogin
        ? await authApi.login(email.trim(), trimmedPassword)
        : await authApi.register(email.trim(), trimmedPassword);

      console.log('Auth success:', data);
      setUser(data.user);
      navigate('/chat');
    } catch (err: any) {
      console.error('Auth error:', err);
      const details = err?.response?.data?.details as Array<{ path: string; message: string }> | undefined;
      if (details && details.length > 0) {
        setError(details.map((d) => d.message).join(' '));
      } else {
        const errorMessage = err?.response?.data?.error;
        if (errorMessage === 'EMAIL_TAKEN') {
          setError('This email is already registered. Please use a different email or sign in instead.');
        } else if (errorMessage === 'INVALID_CREDENTIALS') {
          setError('Invalid credentials. Please check your email and password.');
        } else {
          setError(
            errorMessage ||
              (isLogin
                ? 'Invalid credentials. Please check your email and password.'
                : 'Validation failed. Password must be 6–64 characters.')
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/beli_logo_light.svg" 
              alt="Beli Logo" 
              className="w-16 h-16"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in' : 'Sign up'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Beli — Your Study Buddy & Uni Companion</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={isLogin ? undefined : 6}
                maxLength={isLogin ? undefined : 64}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={isLogin ? 'Password' : 'Password (6–64 characters)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">Password must be 6–64 characters.</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


