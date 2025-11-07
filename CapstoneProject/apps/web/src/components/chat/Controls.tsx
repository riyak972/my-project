import { useState } from 'react';
import { useChatStore } from '../../lib/store';
import { sessionsApi } from '../../lib/api';
import ProviderPicker from './ProviderPicker';

export default function Controls() {
  const { currentSessionId, temperature, systemPrompt, setTemperature, setSystemPrompt } =
    useChatStore();
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (!currentSessionId || !confirm('Clear all messages in this session?')) return;

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
    if (!currentSessionId || !confirm('Summarize this conversation?')) return;

    setLoading(true);
    try {
      await sessionsApi.summarize(currentSessionId);
      alert('Session summarized successfully');
      window.location.reload();
    } catch (error) {
      console.error('Failed to summarize session:', error);
      alert('Failed to summarize session');
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
      alert('Failed to export session');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSessionId) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a session to view controls
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Controls</h3>

      <ProviderPicker />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature: {temperature.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter system prompt..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={5}
        />
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Summarize
        </button>
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Export
        </button>
      </div>
    </div>
  );
}


