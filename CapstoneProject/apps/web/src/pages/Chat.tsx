import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useChatStore } from '../lib/store';
import { authApi, sessionsApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import HistorySidebar from '../components/chat/HistorySidebar';
import ChatActions from '../components/chat/ChatActions';
import SettingsDialog from '../components/settings/SettingsDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';

interface Session {
  _id: string;
  title: string;
  lastActivityAt: string;
  createdAt: string;
}

export default function Chat() {
  const { user, setUser, currentSessionId, setCurrentSession } = useChatStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Initialize session on first load
  useEffect(() => {
    const initializeSession = async () => {
      if (!user) return;
      
      try {
        // Check if user has existing sessions
        const data = await sessionsApi.list();
        const sessions: Session[] = data.sessions || [];
        
        if (sessions.length === 0) {
          // No sessions exist, create first session
          console.log('Creating first session for new user...');
          const newSession = await sessionsApi.create({
            title: 'Welcome to Beli! 👋',
            systemPrompt: 'You are Beli, a friendly AI study companion for students. Help them with their studies, provide summaries, answer questions, and offer support with a warm, encouraging tone.'
          });
          setCurrentSession(newSession._id);
        } else if (!currentSessionId || !sessions.find((s: Session) => s._id === currentSessionId)) {
          // No current session selected or current session doesn't exist, select the most recent one
          const mostRecent = sessions.sort((a: Session, b: Session) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())[0];
          setCurrentSession(mostRecent._id);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, [user, currentSessionId, setCurrentSession]);

  if (!user) {
    return null;
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white`}>
        <HistorySidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={sidebarOpen ? 'Hide history' : 'Show history'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="/beli_logo_light.svg" 
                alt="Beli Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-semibold text-gray-900">Beli — Your Study Buddy</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ChatActions />
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => setLogoutConfirm(true)}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>

      {settingsOpen && (
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      )}

      <ConfirmDialog
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={() => {
          setLogoutConfirm(false);
          handleLogout();
        }}
        title="Confirm Logout"
        description="Are you sure you want to logout? You'll need to sign in again to continue using Beli."
        confirmText="Logout"
        variant="default"
      />
    </div>
  );
}


