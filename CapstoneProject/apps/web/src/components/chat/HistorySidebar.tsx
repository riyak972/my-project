import { useEffect, useState } from 'react';
import { useChatStore } from '../../lib/store';
import { sessionsApi } from '../../lib/api';
import { formatRelativeTime } from '../../lib/format';
import { Pencil } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Session {
  _id: string;
  title: string;
  lastActivityAt: string;
  createdAt: string;
}

function InlineRename({ id, title, onRenamed }: { id: string; title: string; onRenamed: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [errorDialog, setErrorDialog] = useState(false);

  useEffect(() => setValue(title), [title]);

  const submit = async () => {
    const newTitle = value.trim();
    if (!newTitle || newTitle === title) {
      setEditing(false);
      return;
    }
    const prev = title;
    onRenamed(newTitle);
    try {
      await sessionsApi.update(id, { title: newTitle });
    } catch (e) {
      onRenamed(prev);
      setErrorDialog(true);
    } finally {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full bg-transparent font-medium outline-none border-b border-indigo-300"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{title}</div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          aria-label="Rename"
          title="Rename"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <ConfirmDialog
        open={errorDialog}
        onClose={() => setErrorDialog(false)}
        onConfirm={() => setErrorDialog(false)}
        title="Rename Failed"
        description="Unable to rename the session. Please try again."
        confirmText="OK"
        variant="default"
      />
    </>
  );
}

export default function HistorySidebar({ onClose }: { onClose: () => void }) {
  const { currentSessionId, setCurrentSession } = useChatStore();
  const [sessions, setSessions] = useState<Session[]>([]);
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

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.list();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const session = await sessionsApi.create();
      setCurrentSession(session._id);
      // Sync defaults after creation
      try {
        const full = await sessionsApi.get(session._id);
        // Safely update local store via a shallow import to avoid circular
        const { setModel, setTemperature } = useChatStore.getState();
        if (typeof full.temperature === 'number') setTemperature(full.temperature);
        if (typeof full.model === 'string') setModel(full.model);
      } catch {}
      await loadSessions();
    } catch (error: any) {
      console.error('Failed to create session:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to create session';
      setErrorDialog({
        open: true,
        title: 'Session Creation Failed',
        description: `Unable to create a new session: ${errorMessage}`
      });
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    // Load session details and sync fields
    sessionsApi
      .get(sessionId)
      .then((full) => {
        const { setModel, setTemperature } = useChatStore.getState();
        if (typeof full.temperature === 'number') setTemperature(full.temperature);
        if (typeof full.model === 'string') setModel(full.model);
      })
      .catch(() => {});
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">History</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-2 border-b border-gray-200">
        <button
          onClick={handleCreateSession}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No sessions yet</div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`group w-full text-left px-3 py-2 rounded-md mb-1 cursor-pointer ${
                  currentSessionId === session._id
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
                onClick={() => handleSelectSession(session._id)}
              >
                <InlineRename
                  id={session._id}
                  title={session.title}
                  onRenamed={(newTitle) => {
                    setSessions((prev) => prev.map((s) => (s._id === session._id ? { ...s, title: newTitle } : s)));
                  }}
                />
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(session.lastActivityAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ConfirmDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
        onConfirm={() => setErrorDialog(prev => ({ ...prev, open: false }))}
        title={errorDialog.title}
        description={errorDialog.description}
        confirmText="OK"
        variant="default"
      />
    </div>
  );
}


