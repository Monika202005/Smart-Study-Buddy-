import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, BrainCircuit, Bot, Clock, ChevronDown } from 'lucide-react';
import TeammateModuleStub from '../components/layout/TeammateModuleStub';
import { fetchSubjectsApi } from '../services/api';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function SubjectsPage() {
  const { openChatWithPrompt, generateCustomQuiz } = useStore();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState('cs301');

  useEffect(() => {
    async function load() {
      const data = await fetchSubjectsApi();
      setSubjects(data.subjects || []);
    }
    load();
  }, []);

  const handleQuizTopic = async (topicName, subjectName) => {
    await generateCustomQuiz(topicName, subjectName);
    navigate('/flashcards');
  };

  return (
    <TeammateModuleStub
      title="Subjects & Syllabus Checklist"
      memberLetter="C"
      memberRole="Planner UI + Subjects"
      description="Manage enrolled subjects, topic breakdown with estimated hours and difficulty weights, and progress tracking."
      apisPlanned={[
        'GET/POST /api/subjects',
        'PUT/DELETE /api/subjects/:id',
        'GET/POST /api/subjects/:id/topics',
      ]}
    >
      <div className="space-y-4">
        {subjects.map((sub) => {
          const isExpanded = expandedSubject === sub.id;
          const completedCount = sub.topics?.filter((t) => t.status === 'completed').length || 0;
          const totalCount = sub.topics?.length || 1;
          const percent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={sub.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-md"
            >
              {/* Subject Header */}
              <div
                onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-10 rounded-full"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{sub.name}</h3>
                    <p className="text-xs text-slate-400">
                      Exam Date: <strong className="text-indigo-300">{sub.examDate}</strong> &bull; {completedCount}/{totalCount} topics mastered
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress Ring */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-200">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: sub.color || '#6366f1' }}
                      />
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Topics Checklist (Collapsible) */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-900/30 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-2">
                    Syllabus Topics & Active Recall Links
                  </div>

                  {sub.topics?.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            topic.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        <div>
                          <p className={`font-semibold ${topic.status === 'completed' ? 'text-slate-300 line-through' : 'text-white'}`}>
                            {topic.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Est. {topic.estimatedHours} hrs &bull; Difficulty: Level {topic.difficulty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuizTopic(topic.name, sub.name)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                          <span>Quiz Me</span>
                        </button>

                        <button
                          onClick={() =>
                            openChatWithPrompt(
                              `Explain "${topic.name}" from ${sub.name} in simple terms with an analogy and 1 quiz question.`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Bot className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Tutor</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TeammateModuleStub>
  );
}
