import React, { useState } from 'react';
import {
  X,
  BrainCircuit,
  Clock,
  Layers,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFFICULTY_COLORS = {
  1: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  3: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function AddTopicModal({ subject, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Topic name is required.'); return; }
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), difficulty, estimatedHours });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add topic.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-3 h-7 rounded-full"
                style={{ backgroundColor: subject?.color || '#6366f1' }}
              />
              <p className="text-[11px] text-slate-400 font-semibold">{subject?.name}</p>
            </div>
            <h2 className="text-base font-extrabold text-white ml-5">Add Topic</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Topic name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Topic Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AVL Trees"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              <BrainCircuit className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === d
                      ? DIFFICULTY_COLORS[d]
                      : 'bg-slate-800/60 text-slate-500 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated hours */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-bold text-slate-300">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Estimated Study Hours
              </label>
              <span className="font-extrabold text-indigo-400">{estimatedHours}h</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>0.5h</span><span>10h</span>
            </div>
          </div>

          {/* Cognitive weight preview */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
            <p className="text-slate-400">
              <Layers className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
              Cognitive weight:{' '}
              <strong className="text-indigo-300">
                {(difficulty * estimatedHours).toFixed(1)} pts
              </strong>
              <span className="text-slate-600"> (difficulty × hours — used by auto-scheduler)</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {loading ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

