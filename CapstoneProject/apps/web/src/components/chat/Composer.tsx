import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../lib/store';
import { chatApi } from '../../lib/api';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function Composer() {
  const { currentSessionId, provider, model, temperature, systemPrompt } =
    useChatStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: '',
    description: ''
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!content.trim() || !currentSessionId || loading || streaming) return;

    const messageContent = content;
    setContent('');
    setLoading(true);
    setStreaming(true);
    setStreamedContent('');

    try {
      await chatApi.stream(
        {
          sessionId: currentSessionId,
          content: messageContent,
          provider,
          model: model || undefined,
          temperature,
          systemPrompt: systemPrompt || undefined,
        },
        (chunk) => {
          if (chunk.type === 'text') {
            setStreamedContent((prev) => prev + chunk.delta);
          } else if (chunk.type === 'event' && chunk.name === 'end') {
            setStreaming(false);
            setLoading(false);
            // Reload messages by triggering a window event
            window.dispatchEvent(new Event('messages-updated'));
          } else if (chunk.type === 'event' && chunk.name === 'error') {
            setStreaming(false);
            setLoading(false);
            setErrorDialog({
              open: true,
              title: 'Streaming Error',
              description: chunk.data?.message || 'An unknown error occurred during streaming.'
            });
          }
        }
      );
    } catch (error: any) {
      setStreaming(false);
      setLoading(false);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to send message';
      setErrorDialog({
        open: true,
        title: 'Message Failed',
        description: errorMessage
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentSessionId) {
    return null;
  }

  return (
    <div className="p-4">
      {streaming && streamedContent && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
          <div className="font-semibold mb-1">Streaming response:</div>
          <div className="whitespace-pre-wrap">{streamedContent}</div>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={loading || streaming}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 resize-none"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={loading || streaming || !content.trim()}
          className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={loading || streaming ? 'Sending...' : 'Send message'}
        >
          {loading || streaming ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      
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


