import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  CalendarDays,
  BookOpen,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  ChevronDown,
} from 'lucide-react';

/* ──────────────────── tiny helpers ──────────────────── */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ──────────────────── data ──────────────────── */
const FEATURES = [
  {
    icon: Bot,
    color: 'from-indigo-600 to-purple-600',
    glow: 'shadow-indigo-600/30',
    title: 'AI Study Tutor',
    desc: 'Context-aware Gemini AI that knows your exam dates, today\'s tasks, and weak topics. Ask anything, anytime.',
    tag: 'Member 1',
  },
  {
    icon: CalendarDays,
    color: 'from-sky-500 to-indigo-500',
    glow: 'shadow-sky-500/30',
    title: 'Smart Planner',
    desc: 'Drag-and-drop calendar with AI auto-scheduling. Missed tasks are auto-rebalanced so you never fall behind.',
    tag: 'Member C',
  },
  {
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
    title: 'Subjects & Syllabus',
    desc: 'Organise every subject, topic, difficulty weight and exam date. Track coverage % at a glance.',
    tag: 'Member C',
  },
  {
    icon: BrainCircuit,
    color: 'from-purple-600 to-pink-600',
    glow: 'shadow-purple-600/30',
    title: 'Flashcards & Quiz',
    desc: '3-D flip flashcards, multiple-choice quiz mode and automatic weak-topic detection with 1-click tutor bridge.',
    tag: 'Member 1',
  },
  {
    icon: Clock,
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    title: 'Pomodoro Timer',
    desc: '25/5 focus cycles with session logging. Every minute you study feeds the analytics engine.',
    tag: 'Member D',
  },
  {
    icon: BarChart3,
    color: 'from-rose-500 to-pink-500',
    glow: 'shadow-rose-500/30',
    title: 'Analytics & Streaks',
    desc: 'Weekly study hours, subject distribution charts, streak counter and completion-rate trends.',
    tag: 'Member D',
  },
];

const STATS = [
  { value: '6', label: 'Core modules', icon: Sparkles },
  { value: '4', label: 'AI tool-actions', icon: Zap },
  { value: '100%', label: 'Offline-safe', icon: Shield },
  { value: '4', label: 'Team members', icon: Users },
];

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    course: 'B.Tech CSE, 3rd Year',
    text: '"StudyBuddy told me I had an overdue DSA task and rescheduled it before I even noticed. Passed my mid-term comfortably!"',
    stars: 5,
  },
  {
    name: 'Rohan Mehta',
    course: 'MCA, 2nd Year',
    text: '"The AI quiz mode caught that I kept failing B+ Trees questions and pushed revision flashcards automatically. Brilliant!"',
    stars: 5,
  },
  {
    name: 'Sneha Kulkarni',
    course: 'B.Sc Data Science',
    text: '"Finally a planner that actually accounts for exam urgency. The subject syllabus view alone saved my semester."',
    stars: 5,
  },
];

const HOW_STEPS = [
  {
    num: '01',
    title: 'Add your subjects & exam dates',
    desc: 'Enter each subject, its syllabus topics, difficulty levels and your exam date. StudyBuddy calculates urgency scores automatically.',
  },
  {
    num: '02',
    title: 'Generate your personalised plan',
    desc: 'One click triggers the greedy scheduling algorithm. It fills your calendar respecting your daily hour limit and pre-exam revision buffers.',
  },
  {
    num: '03',
    title: 'Study with AI by your side',
    desc: 'The floating AI tutor knows today\'s plan. Ask it to explain a concept, reschedule a missed task or generate flashcards — all in natural language.',
  },
  {
    num: '04',
    title: 'Track, quiz & improve',
    desc: 'Quiz yourself on weak topics, log Pomodoro sessions and watch the analytics dashboard update your streak in real time.',
  },
];

/* ──────────────────── component ──────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">

      {/* ── Sticky Nav ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-xl shadow-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/40">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">StudyBuddy</span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors font-medium hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 overflow-hidden">
        {/* ambient blobs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by Google Gemini AI · Full Stack Team of 4</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Study Smarter,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Not Harder
            </span>
          </h1>

          {/* Sub */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            StudyBuddy combines an algorithmic study planner, a context-aware AI tutor, active-recall flashcards and
            analytics into one seamless academic companion.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Studying Free</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base border border-slate-700 transition-all"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-4 text-xs text-slate-500">
            {['No credit card required', 'Works offline', 'GDPR-safe'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-12 border-y border-slate-800/60 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <FadeIn key={label} delay={i * 80} className="text-center space-y-1">
              <div className="flex justify-center mb-1">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-14 space-y-3">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Six Modules. One Platform.</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Built by a team of 4, each module is a full-stack feature with live backend APIs, real-time UI and
              AI-enhanced interactions.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, glow, title, desc, tag }, i) => (
              <FadeIn key={title} delay={i * 90}>
                <div className="group relative h-full p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
                  {/* glow accent */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${glow} mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base">{title}</h3>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                      {tag}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 px-4 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14 space-y-3">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Simple 4-step flow</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How StudyBuddy Works</h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {HOW_STEPS.map(({ num, title, desc }, i) => (
              <FadeIn key={num} delay={i * 100}>
                <div className="flex gap-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-600/30">
                    {num}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14 space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Student reviews</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Loved by Students</h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, course, text, stars }, i) => (
              <FadeIn key={name} delay={i * 100}>
                <div className="h-full p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed italic">{text}</p>
                  <div>
                    <p className="text-white font-bold text-sm">{name}</p>
                    <p className="text-slate-500 text-[11px]">{course}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/30 mb-2">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to ace your exams?</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Join StudyBuddy today — set up your subjects, generate a personalised plan and let the AI tutor guide you
              to the finish line.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">StudyBuddy</span>
            <span>· Full Stack Team of 4 · 6-Week Project</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/chat" className="hover:text-slate-300 transition-colors">AI Tutor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

