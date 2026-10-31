import React, { useState } from 'react';
import { X, Sparkles, BrainCircuit } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function GenerateQuizModal({ isOpen, onClose }) {
  const { generateCustomQuiz, isFlashcardsLoading } = useStore();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic to generate flashcards.');
      return;
    }

    setError(null);
    try {
      await generateCustomQuiz(topic.trim(), subject);
      onClose();
    } catch (err) {
      setError(err.message || 'Generation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Generate Study Flashcards</h3>
            <p className="text-xs text-slate-400">AI-generated high-yield questions for any topic</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Computer Networks">Computer Networks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Topic or Syllabus Section
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming, B+ Trees, Paging..."
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isFlashcardsLoading || !topic.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>{isFlashcardsLoading ? 'Generating...' : 'Generate 3 Questions'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
