import { useEffect, useMemo, useState } from 'react';
import { configApi, sessionsApi } from '../../lib/api';
import { useChatStore } from '../../lib/store';

interface ProviderInfo {
	name: string;
	enabled: boolean;
}

// Minimal model catalog per provider (keep aligned with backend defaults)
const DEFAULT_MODELS: Record<string, string[]> = {
	mock: ['mock-model'],
	gemini: ['gemini-2.5-flash'],
	openai: ['gpt-3.5-turbo'],
	dialogflow: ['dialogflow-default'],
};

export default function ModelSelector() {
	const { currentSessionId, model, setModel } = useChatStore();
	const [providers, setProviders] = useState<ProviderInfo[]>([]);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const cfg = await configApi.get();
				setProviders(cfg.providers || []);
			} catch (e) {
				console.error('Failed to load providers', e);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const options = useMemo(() => {
		const opts: Array<{ key: string; label: string; disabled: boolean; tooltip?: string }> = [];
		for (const p of providers) {
			const models = DEFAULT_MODELS[p.name] || [];
			for (const m of models) {
				opts.push({
					key: `${p.name}:${m}`,
					label: `${p.name}/${m}`,
					disabled: !p.enabled,
					tooltip: p.enabled ? undefined : 'Add API key in backend to enable this model',
				});
			}
		}
		return opts;
	}, [providers]);

	const onChange = async (value: string) => {
		if (!currentSessionId) return;
		setSaving(true);
		const prev = model;
		setModel(value.split(':')[1]); // store only model id (e.g., gpt-3.5-turbo)
		try {
			await sessionsApi.update(currentSessionId, { model: value.split(':')[1] });
		} catch (e: any) {
			setModel(prev);
			alert(e?.response?.data?.error || 'Failed to update model');
		} finally {
			setSaving(false);
		}
	};

	// Resolve current select value as provider+model key if possible
	const currentValue = useMemo(() => {
		if (!model) return '';
		const match = options.find((o) => o.label.endsWith(`/${model}`));
		return match ? match.key : '';
	}, [model, options]);

	if (loading) {
		return <div className="text-sm text-gray-500">Loading models…</div>;
	}

	return (
		<div className="flex items-center gap-2 text-sm">
			<label className="text-gray-600">Model</label>
			<select
				value={currentValue}
				onChange={(e) => onChange(e.target.value)}
				disabled={saving || options.length === 0}
				className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50"
				title={options.find((o) => o.key === currentValue)?.tooltip}
			>
				<option value="" disabled>
					Select model
				</option>
				{options.map((o) => (
					<option key={o.key} value={o.key} disabled={o.disabled} title={o.tooltip}>
						{o.label}{o.disabled ? ' (disabled)' : ''}
					</option>
				))}
			</select>
		</div>
	);
}

