import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  BrainCircuit,
  Bot,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Search,
  AlertCircle,
  Target,
  Clock,
  Layers,
  CalendarDays,
} from 'lucide-react';
import AddSubjectModal from '../components/subjects/AddSubjectModal';
import AddTopicModal from '../components/subjects/AddTopicModal';
import {
  fetchSubjectsApi,
  createSubjectApi,
  deleteSubjectApi,
  createTopicApi,
  updateTopicStatusApi,
  deleteTopicApi,
} from '../services/api';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

/* Pure-JS exam countdown */
function getDaysUntil(dateStr) {
  const examMs = new Date(dateStr).setHours(0, 0, 0, 0);
  const todayMs = new Date().setHours(0, 0, 0, 0);
  return Math.round((examMs - todayMs) / 86400000);
}

/* ── Exam countdown badge ── */
function ExamCountdown({ examDate }) {
  const days = getDaysUntil(examDate);
  if (days < 0) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">Exam passed</span>;
  if (days === 0) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">TODAY!</span>;
  if (days <= 3) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">In {days}d ⚠️</span>;
  if (days <= 7) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">In {days}d</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">In {days}d</span>;
}

const STATUS_STYLES = {
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  pending: 'bg-slate-800 text-slate-500 border-slate-700',
};
const STATUS_LABELS = { completed: 'Mastered', in_progress: 'In Progress', pending: 'Pending' };
const NEXT_STATUS = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };

/* ── Topic row ── */
function TopicRow({ topic, onQuiz, onTutor, onStatusChange, onDelete }) {
  const normStatus = (topic.status === 'in-progress' ? 'in_progress' : topic.status) || 'pending';

  return (
    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all group">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          onClick={() => onStatusChange(topic.id, NEXT_STATUS[normStatus] || 'pending')}
          title="Click to cycle status"
          className="shrink-0"
        >
          <CheckCircle
            className={`w-4 h-4 transition-colors ${
              normStatus === 'completed' ? 'text-emerald-400' :
              normStatus === 'in_progress' ? 'text-amber-400' :
              'text-slate-600 hover:text-slate-400'
            }`}
          />
        </button>

        <div className="min-w-0">
          <p className={`font-semibold truncate ${normStatus === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
            {topic.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-slate-500 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {topic.estimatedHours}h
            </span>
            <span className="text-slate-500 flex items-center gap-0.5">
              <Layers className="w-3 h-3" /> Difficulty L{topic.difficulty}
            </span>
            <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${STATUS_STYLES[normStatus] || STATUS_STYLES.pending}`}>
              {STATUS_LABELS[normStatus] || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <button
          onClick={() => onQuiz(topic.name)}
          className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> Quiz Me
        </button>

        <button
          onClick={() => onTutor(topic.name)}
          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" /> Tutor
        </button>

        <button
          onClick={() => onDelete(topic.id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Subject card ── */
function SubjectCard({
  subject, isExpanded, onToggle,
  onAddTopic, onDeleteSubject,
  onTopicQuiz, onTopicTutor, onTopicStatusChange, onDeleteTopic,
}) {
  const completedCount = subject.topics?.filter((t) => t.status === 'completed').length || 0;
  const totalCount = subject.topics?.length || 0;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalHours = subject.topics?.reduce((s, t) => s + (t.estimatedHours || 0), 0) || 0;
  const completedHours = subject.topics?.filter((t) => t.status === 'completed').reduce((s, t) => s + (t.estimatedHours || 0), 0) || 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-md hover:border-slate-700 transition-all">
      {/* Subject header */}
      <div
        onClick={onToggle}
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: subject.color || '#6366f1' }} />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">{subject.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px] text-slate-400">
              <CalendarDays className="w-3 h-3" />
              <span>Exam: <strong className="text-indigo-300">{subject.examDate}</strong></span>
              <ExamCountdown examDate={subject.examDate} />
              <span>·</span>
              <span>{completedCount}/{totalCount} mastered</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {completedHours}/{totalHours}h done</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Progress bar */}
          <div className="w-36 hidden sm:block">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Coverage</span>
              <span className="font-bold text-white">{percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: subject.color || '#6366f1' }}
              />
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }}
            className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded topics */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-900/30 space-y-3">
          {/* Syllabus stats row */}
          <div className="flex flex-wrap items-center gap-3 py-3 text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span><strong className="text-white">{totalCount}</strong> topics</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-white">{totalHours}h</strong> total</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span><strong>{completedCount}</strong> mastered</span>
            </div>
            {/* Mobile progress */}
            <div className="sm:hidden flex items-center gap-2 flex-1 min-w-[120px]">
              <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: subject.color || '#6366f1' }} />
              </div>
              <span className="text-white font-bold">{percent}%</span>
            </div>
          </div>

          {/* Topics */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1 pb-1">
            Syllabus Topics
          </div>
          <div className="space-y-2">
            {(subject.topics || []).map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onQuiz={(name) => onTopicQuiz(name, subject.name)}
                onTutor={(name) => onTopicTutor(name, subject.name)}
                onStatusChange={onTopicStatusChange}
                onDelete={onDeleteTopic}
              />
            ))}
            {totalCount === 0 && (
              <p className="text-[11px] text-slate-600 italic py-2">No topics yet. Add your first topic!</p>
            )}
          </div>

          {/* Add topic button */}
          <button
            onClick={() => onAddTopic(subject)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-500 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-indigo-950/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main SubjectsPage ── */
export default function SubjectsPage() {
  const { openChatWithPrompt, generateCustomQuiz } = useStore();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [addTopicFor, setAddTopicFor] = useState(null); // subject object
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg, type = 'ok') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSubjectsApi();
      setSubjects(data.subjects || []);
      if (data.subjects?.length > 0 && !expandedId) {
        setExpandedId(data.subjects[0].id);
      }
    } catch (e) { console.warn('Failed to load subjects:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  /* ── subject actions ── */
  const handleAddSubject = async (data) => {
    const res = await createSubjectApi(data);
    if (res.success && res.subject) {
      setSubjects((prev) => [...prev, res.subject]);
      setExpandedId(res.subject.id);
      showFeedback(`Subject "${res.subject.name}" added!`);
    }
    return res;
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject and all its topics?')) return;
    try {
      await deleteSubjectApi(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      showFeedback('Subject deleted.');
    } catch { showFeedback('Failed to delete subject.', 'err'); }
  };

  /* ── topic actions ── */
  const handleAddTopic = async (data) => {
    const res = await createTopicApi(addTopicFor.id, data);
    if (res.success && res.topic) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === addTopicFor.id ? { ...s, topics: [...(s.topics || []), res.topic] } : s
        )
      );
      showFeedback(`Topic "${res.topic.name}" added!`);
    }
    return res;
  };

  const handleTopicStatusChange = async (topicId, newStatus) => {
    try {
      const res = await updateTopicStatusApi(topicId, newStatus);
      if (res.success) {
        setSubjects((prev) =>
          prev.map((s) => ({
            ...s,
            topics: s.topics?.map((t) => t.id === topicId ? { ...t, status: newStatus } : t),
          }))
        );
      }
    } catch { showFeedback('Failed to update topic status.', 'err'); }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await deleteTopicApi(topicId);
      setSubjects((prev) =>
        prev.map((s) => ({
          ...s,
          topics: s.topics?.filter((t) => t.id !== topicId),
        }))
      );
      showFeedback('Topic removed.');
    } catch { showFeedback('Failed to delete topic.', 'err'); }
  };

  /* ── quiz / tutor ── */
  const handleQuiz = async (topicName, subjectName) => {
    await generateCustomQuiz(topicName, subjectName);
    navigate('/flashcards');
  };

  const handleTutor = (topicName, subjectName) => {
    openChatWithPrompt(`Explain "${topicName}" from ${subjectName} with a simple analogy and quiz me at the end.`);
  };

  /* ── filtered subjects ── */
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.topics?.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── totals ── */
  const totalTopics = subjects.reduce((sum, s) => sum + (s.topics?.length || 0), 0);
  const masteredTopics = subjects.reduce((sum, s) => sum + (s.topics?.filter((t) => t.status === 'completed').length || 0), 0);
  const overallPercent = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Subjects & Syllabus</h1>
          </div>
          <p className="text-xs text-slate-400">Manage your enrolled subjects, topics, difficulty weights and exam dates.</p>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Subject
        </button>
      </div>

      {/* ── Overview stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Subjects', value: subjects.length, color: 'text-indigo-300', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Total Topics', value: totalTopics, color: 'text-slate-200', bg: 'bg-slate-800/60 border-slate-700/60' },
          { label: 'Mastered', value: masteredTopics, color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Coverage', value: `${overallPercent}%`, color: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg} text-center`}>
            <p className={`text-2xl font-extrabold ${color}`}>{loading ? '—' : value}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'ok'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
        }`}>
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects or topics…"
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
        />
      </div>

      {/* ── Subject cards ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto" />
          <p className="text-slate-500 text-sm">
            {subjects.length === 0
              ? 'No subjects yet. Add your first subject!'
              : 'No results for your search.'}
          </p>
          {subjects.length === 0 && (
            <button
              onClick={() => setShowAddSubject(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              isExpanded={expandedId === sub.id}
              onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              onAddTopic={(s) => setAddTopicFor(s)}
              onDeleteSubject={handleDeleteSubject}
              onTopicQuiz={handleQuiz}
              onTopicTutor={handleTutor}
              onTopicStatusChange={handleTopicStatusChange}
              onDeleteTopic={handleDeleteTopic}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showAddSubject && (
        <AddSubjectModal
          onClose={() => setShowAddSubject(false)}
          onAdd={handleAddSubject}
        />
      )}

      {addTopicFor && (
        <AddTopicModal
          subject={addTopicFor}
          onClose={() => setAddTopicFor(null)}
          onAdd={handleAddTopic}
        />
      )}
    </div>
  );
}
