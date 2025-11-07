import { useState } from 'react';
import { X, FileText, Share } from 'lucide-react';
import { useChatStore } from '../../lib/store';
import { sessionsApi } from '../../lib/api';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function ChatActions() {
  const { currentSessionId } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  const showConfirm = (title: string, description: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
    setConfirmDialog({ open: true, title, description, action, variant });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleClear = async () => {
    if (!currentSessionId) return;

    setLoading(true);
    try {
      await sessionsApi.clear(currentSessionId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear session:', error);
      alert('Failed to clear session');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentSessionId) return;

    setLoading(true);
    try {
      await sessionsApi.summarize(currentSessionId);
      showConfirm(
        'Session Summarized',
        'Your conversation has been successfully summarized. The page will refresh to show the updated content.',
        () => window.location.reload()
      );
    } catch (error) {
      console.error('Failed to summarize session:', error);
      showConfirm(
        'Summarization Failed',
        'Unable to summarize the session. Please try again.',
        () => {},
        'destructive'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!currentSessionId) return;

    setLoading(true);
    try {
      const data = await sessionsApi.export(currentSessionId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${currentSessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export session:', error);
      showConfirm(
        'Export Failed',
        'Unable to export the session. Please try again.',
        () => {},
        'destructive'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentSessionId) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => showConfirm(
            'Clear Session',
            'Are you sure you want to clear all messages in this session? This action cannot be undone.',
            handleClear,
            'destructive'
          )}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear all messages"
        >
          <X className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => showConfirm(
            'Summarize Session',
            'This will create a summary of the current conversation. Continue?',
            handleSummarize
          )}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Summarize conversation"
        >
          <FileText className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleExport}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export session"
        >
          <Share className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={() => {
          confirmDialog.action();
          closeConfirm();
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.variant === 'destructive' ? 'Clear' : 'Continue'}
      />
    </>
  );
}
