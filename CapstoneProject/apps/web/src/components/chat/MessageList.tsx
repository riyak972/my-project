import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../lib/store';
import { sessionsApi } from '../../lib/api';
import { formatTime } from '../../lib/format';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Message {
  _id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: string;
  providerMeta?: {
    provider: string;
    model: string;
  };
}

export default function MessageList() {
  const { currentSessionId } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: '',
    description: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSessionId) return;

    const loadMessages = async () => {
      if (!currentSessionId) return;
      
      setLoading(true);
      try {
        const data = await sessionsApi.getMessages(currentSessionId);
        setMessages(data.messages || []);
      } catch (error: any) {
        console.error('Failed to load messages:', error);
        const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to load messages';
        // Only show error if it's not a 404 (no messages yet)
        if (error?.response?.status !== 404) {
          setErrorDialog({
            open: true,
            title: 'Failed to Load Messages',
            description: errorMessage
          });
        }
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Listen for messages-updated event
    const handleMessagesUpdate = () => {
      loadMessages();
    };
    window.addEventListener('messages-updated', handleMessagesUpdate);
    
    return () => {
      window.removeEventListener('messages-updated', handleMessagesUpdate);
    };
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-prose rounded-xl px-4 py-3 shadow-sm ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white'
                : message.role === 'system'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap break-words overflow-x-auto">
                {message.content}
              </div>
            </div>
            <div
              className={`text-xs mt-2 pt-1 border-t ${
                message.role === 'user' 
                  ? 'text-indigo-200 border-indigo-400/30' 
                  : message.role === 'system'
                  ? 'text-amber-600 border-amber-200'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{formatTime(message.createdAt)}</span>
                {message.providerMeta && (
                  <span className="text-xs opacity-75">
                    {message.providerMeta.provider} • {message.providerMeta.model}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
      
      <ConfirmDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
        onConfirm={() => setErrorDialog(prev => ({ ...prev, open: false }))}
        title={errorDialog.title}
        description={errorDialog.description}
        confirmText="OK"
        variant="destructive"
      />
    </div>
  );
}


