import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
}

interface ChatState {
  user: User | null;
  currentSessionId: string | null;
  provider: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  setUser: (user: User | null) => void;
  setCurrentSession: (sessionId: string | null) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setSystemPrompt: (prompt: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      user: null,
      currentSessionId: null,
      provider: 'mock',
      model: '',
      temperature: 0.7,
      systemPrompt: '',
      setUser: (user) => set({ user }),
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

