import { create } from 'zustand';
import {
  sendChatMessage,
  fetchChatHistory,
  clearChatHistoryApi,
  fetchFlashcardsApi,
  generateQuizApi,
  recordQuizResultApi,
  fetchWeakTopicsApi,
} from '../services/api.js';

export const useStore = create((set, get) => ({
  // User state
  user: {
    id: 'default_student_1',
    name: 'Monika Sharma',
    email: 'monika@studybuddy.dev',
    dailyHours: 4,
    streak: 4,
    role: 'Lead (Member 1)',
  },

  // Chatbot State (Member 1)
  chatMessages: [],
  isChatLoading: false,
  chatError: null,
  floatingChatOpen: false,

  // Flashcards & Quiz State (Member 1)
  flashcards: [],
  isFlashcardsLoading: false,
  weakTopics: [],
  flashcardFilter: 'all', // 'all' | 'incorrect' | 'untested' | 'correct'

  // Server health state
  isServerConnected: true,

  // Actions: Chat
  loadChatHistory: async () => {
    try {
      set({ isChatLoading: true, chatError: null });
      const data = await fetchChatHistory();
      if (data.success && data.messages) {
        set({ chatMessages: data.messages });
      }
    } catch (err) {
      console.warn('Could not load chat history:', err.message);
      set({ chatError: 'Could not load chat history. Using initial greeting.' });
    } finally {
      set({ isChatLoading: false });
    }
  },

  sendUserMessage: async (text) => {
    if (!text || !text.trim() || get().isChatLoading) return;

    const trimmed = text.trim();
    const tempUserMsg = {
      _id: `temp_u_${Date.now()}`,
      userId: get().user.id,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, tempUserMsg],
      isChatLoading: true,
      chatError: null,
    }));

    try {
      const data = await sendChatMessage(trimmed, get().user.id);
      if (data.success) {
        const assistantMsg = {
          _id: data.messageId || `msg_a_${Date.now()}`,
          userId: get().user.id,
          role: 'assistant',
          content: data.reply,
          toolCalls: data.toolCalls || [],
          createdAt: data.timestamp || new Date().toISOString(),
        };

        set((state) => ({
          chatMessages: [...state.chatMessages, assistantMsg],
          isChatLoading: false,
        }));

        // Refresh weak topics or flashcards if tool generated cards
        if (data.toolCalls?.some((t) => t.tool === 'generate_flashcards')) {
          get().loadFlashcards();
        }
      }
    } catch (err) {
      set({
        isChatLoading: false,
        chatError: err.message || 'Unable to connect to StudyBuddy AI Tutor. Please try again.',
      });
    }
  },

  clearChat: async () => {
    try {
      await clearChatHistoryApi();
      set({ chatMessages: [] });
      await get().loadChatHistory();
    } catch (err) {
      console.warn('Clear chat failed:', err.message);
    }
  },

  toggleFloatingChat: (forceState) => {
    set((state) => ({
      floatingChatOpen: forceState !== undefined ? forceState : !state.floatingChatOpen,
    }));
  },

  openChatWithPrompt: (promptText) => {
    set({ floatingChatOpen: true });
    get().sendUserMessage(promptText);
  },

  // Actions: Flashcards & Quiz
  loadFlashcards: async (filters = {}) => {
    try {
      set({ isFlashcardsLoading: true });
      const data = await fetchFlashcardsApi(filters);
      if (data.success && data.cards) {
        set({ flashcards: data.cards });
      }
    } catch (err) {
      console.warn('Load flashcards failed:', err.message);
    } finally {
      set({ isFlashcardsLoading: false });
    }
  },

  generateCustomQuiz: async (topic, subject) => {
    try {
      set({ isFlashcardsLoading: true });
      const data = await generateQuizApi(topic, subject, 3);
      if (data.success && data.cards) {
        set((state) => ({
          flashcards: [...data.cards, ...state.flashcards],
        }));
        return data.cards;
      }
    } catch (err) {
      throw err;
    } finally {
      set({ isFlashcardsLoading: false });
    }
  },

  recordCardResult: async (cardId, result, selectedOption = null) => {
    try {
      await recordQuizResultApi(cardId, result, selectedOption);
      set((state) => ({
        flashcards: state.flashcards.map((c) =>
          c._id === cardId ? { ...c, lastResult: result } : c
        ),
      }));
      // Re-fetch weak topics when a card is answered
      get().loadWeakTopics();
    } catch (err) {
      console.warn('Record card result failed:', err.message);
    }
  },

  loadWeakTopics: async () => {
    try {
      const data = await fetchWeakTopicsApi();
      if (data.success) {
        set({ weakTopics: data.weakTopics || [] });
      }
    } catch (err) {
      console.warn('Load weak topics failed:', err.message);
    }
  },

  setFlashcardFilter: (filter) => {
    set({ flashcardFilter: filter });
  },
}));
