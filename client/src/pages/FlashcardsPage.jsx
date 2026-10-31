import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Plus,
  Layers,
  HelpCircle,
  AlertTriangle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import FlashcardDeck from '../components/flashcards/FlashcardDeck';
import QuizMode from '../components/flashcards/QuizMode';
import WeakTopicsBanner from '../components/flashcards/WeakTopicsBanner';
import GenerateQuizModal from '../components/flashcards/GenerateQuizModal';

export default function FlashcardsPage() {
  const { flashcards, loadFlashcards, weakTopics, loadWeakTopics } = useStore();
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'quiz' | 'weak'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadFlashcards();
    loadWeakTopics();
  }, []);

  // Filter cards
  const filteredCards = flashcards.filter((card) => {
    if (selectedSubject !== 'all' && card.subjectId !== selectedSubject) {
      return false;
    }
    if (selectedStatus !== 'all' && card.lastResult !== selectedStatus) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-bold">
              ⭐ Member 1 Feature (Flashcards & Quiz Engine)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              Weak-Topic Detection Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Adaptive Flashcards & Quiz Mode</span>
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test active recall with 3D interactive flip cards, multiple-choice quizzes, and automatic weak-topic flagging.
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Generate New Cards</span>
        </button>
      </div>

      {/* Weak Topics Notice Banner */}
      <WeakTopicsBanner />

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcard Decks ({filteredCards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Quiz Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('weak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'weak'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Weak Topics ({weakTopics.length})</span>
          </button>
        </div>

        {/* Filter Dropdowns (when viewing flashcards) */}
        {activeTab === 'flashcards' && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Subjects</option>
              <option value="cs301">CS301 (Data Structures)</option>
              <option value="cs304">CS304 (DBMS)</option>
              <option value="cs308">CS308 (Operating Systems)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="incorrect">Needs Review ⚠️</option>
              <option value="correct">Mastered ✅</option>
              <option value="untested">Untested ⏳</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Body */}
      <div className="pt-2">
        {activeTab === 'flashcards' && <FlashcardDeck cards={filteredCards} />}

        {activeTab === 'quiz' && <QuizMode cards={filteredCards} />}

        {activeTab === 'weak' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Weak-Topic Detection Engine</h3>
            <p className="text-xs text-slate-400">
              The detection algorithm analyzes your quiz answer history. When you answer questions incorrectly, those concepts are grouped here and highlighted to the AI Chatbot tutor so it incorporates them into your daily study recommendations.
            </p>
            <WeakTopicsBanner />
          </div>
        )}
      </div>

      {/* Generator Modal */}
      <GenerateQuizModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
