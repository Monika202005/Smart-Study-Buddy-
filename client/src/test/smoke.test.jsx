import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '../components/chat/ChatInterface';
import FlashcardDeck from '../components/flashcards/FlashcardDeck';
import QuizMode from '../components/flashcards/QuizMode';
import { useStore } from '../store/useStore';

describe('Client Smoke Tests (Member A Slice)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useStore.setState({
      chatMessages: [],
      isChatLoading: false,
      chatError: null,
      tasks: [],
      subjects: [],
      aiMode: 'Offline tutor',
      lastUserMessage: '',
    });
  });

  // 1. Chat message send with mocked fetch
  it('sends a chat message and displays the assistant reply in feed', async () => {
    const mockReply = 'A Stack is a LIFO data structure with push and pop operations.';
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/chat/history')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, messages: [] }),
        });
      }
      if (urlStr.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ status: 'online', aiMode: 'Offline tutor' }),
        });
      }
      if (urlStr.includes('/api/tasks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, tasks: [] }),
        });
      }
      if (urlStr.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, subjects: [] }),
        });
      }
      if (urlStr.includes('/api/chat')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            reply: mockReply,
            toolCalls: [],
            messageId: 'msg_test_123',
            aiMode: 'Offline tutor',
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    render(<ChatInterface />);

    // Wait for initial loadChatHistory to settle so isChatLoading is false
    await waitFor(() => {
      expect(useStore.getState().isChatLoading).toBe(false);
    });

    const input = screen.getByLabelText('Chat query input');
    fireEvent.change(input, { target: { value: 'Explain Stack structure' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/A Stack is a LIFO data structure/i)).toBeInTheDocument();
    });
  });

  // 2. Error state with retry
  it('displays error banner on chat failure and retries on button click', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/chat/history') || urlStr.includes('/api/health') || urlStr.includes('/api/tasks') || urlStr.includes('/api/subjects')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, messages: [], tasks: [], subjects: [] }) });
      }
      if (urlStr.includes('/api/chat')) {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ error: 'AI tutor temporarily unavailable.' }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            reply: 'Recovery response after retry!',
            toolCalls: [],
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    render(<ChatInterface />);

    // Wait for initial loadChatHistory to settle so isChatLoading is false
    await waitFor(() => {
      expect(useStore.getState().isChatLoading).toBe(false);
    });

    const input = screen.getByLabelText('Chat query input');
    fireEvent.change(input, { target: { value: 'Test retry query' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    // Wait for error banner
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText('Retry message')).toBeInTheDocument();
    });

    // Click retry button
    fireEvent.click(screen.getByLabelText('Retry message'));

    await waitFor(() => {
      expect(screen.getByText(/Recovery response after retry!/i)).toBeInTheDocument();
    });
  });

  // 3. Flashcard flip
  it('renders flashcard front and flips to back on user click', async () => {
    const sampleCards = [
      {
        _id: 'c1',
        topicName: 'Binary Search Trees',
        subjectName: 'Data Structures',
        question: 'What is the balance factor of an AVL tree node?',
        answer: 'Height(Left Subtree) - Height(Right Subtree), strictly within {-1, 0, +1}.',
        difficulty: 'medium',
      },
    ];

    render(<FlashcardDeck cards={sampleCards} />);

    // Front question is initially visible
    expect(screen.getByText(/What is the balance factor of an AVL tree node\?/i)).toBeInTheDocument();

    // Click to flip card
    const flipPrompt = screen.getByText(/Click card or tap to flip answer/i);
    fireEvent.click(flipPrompt);

    // Back answer is revealed
    await waitFor(() => {
      expect(screen.getByText(/Height\(Left Subtree\) - Height\(Right Subtree\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Correct Answer/i)).toBeInTheDocument();
    });
  });

  // 4. Quiz answer feedback
  it('provides answer feedback and updates score on option selection', async () => {
    const sampleQuizCards = [
      {
        _id: 'q1',
        topicName: 'Binary Search Trees',
        subjectName: 'Data Structures',
        question: 'What is the worst-case time complexity of search in an unbalanced BST?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 'O(n)',
        difficulty: 'medium',
      },
    ];

    render(<QuizMode cards={sampleQuizCards} />);

    expect(screen.getByText(/worst-case time complexity of search in an unbalanced BST/i)).toBeInTheDocument();

    // Select option O(n)
    const optionBtn = screen.getByText('O(n)');
    fireEvent.click(optionBtn);

    // Verify view results action appears and option is confirmed
    await waitFor(() => {
      expect(screen.getByText(/View Results/i)).toBeInTheDocument();
      expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();
    });
  });
});
