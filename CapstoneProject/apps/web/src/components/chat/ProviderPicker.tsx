import { useEffect, useState } from 'react';
import { useChatStore } from '../../lib/store';
import { configApi } from '../../lib/api';

interface Provider {
  name: string;
  enabled: boolean;
}

export default function ProviderPicker() {
  const { provider, setProvider } = useChatStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const config = await configApi.get();
        setProviders(config.providers || []);
      } catch (error) {
        console.error('Failed to load providers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading providers...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Provider
      </label>
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {providers.map((p) => (
          <option key={p.name} value={p.name} disabled={!p.enabled}>
            {p.name} {p.enabled ? '' : '(disabled)'}
          </option>
        ))}
      </select>
      {providers.find((p) => p.name === provider)?.enabled === false && (
        <p className="mt-1 text-xs text-red-600">
          Set API key in .env to enable this provider
        </p>
      )}
    </div>
  );
}


