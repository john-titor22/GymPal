import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import { useRoutineStore } from '../../store/routineStore';
import { authApi } from '../../api/auth.api';
import { sessionsApi } from '../../api/sessions.api';
import { WorkoutCalendar } from '../../components/ui/WorkoutCalendar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resizeImage } from '../../utils/imageResize';

// ── Achievement definitions ───────────────────────────────────────────────────

const MONTH_TIERS = [
  {
    id: 'm1',  label: 'First Steps',  days: 1,
    desc: 'Show up once. That\'s how it starts.',
    color: { bg: '#f0fdf4', icon: '#bbf7d0', stroke: '#16a34a' },
  },
  {
    id: 'm5',  label: 'Building Habit', days: 5,
    desc: '5 sessions in a month. The routine is forming.',
    color: { bg: '#eff6ff', icon: '#bfdbfe', stroke: '#2563eb' },
  },
  {
    id: 'm10', label: 'Locked In', days: 10,
    desc: '10 days. You don\'t skip anymore.',
    color: { bg: '#faf5ff', icon: '#e9d5ff', stroke: '#9333ea' },
  },
  {
    id: 'm15', label: 'No Days Off', days: 15,
    desc: 'Half the month in the gym. Seriously consistent.',
    color: { bg: '#fff7ed', icon: '#fed7aa', stroke: '#ea580c' },
  },
  {
    id: 'm20', label: 'Unstoppable', days: 20,
    desc: '20 days a month. Rest is earned, not taken.',
    color: { bg: '#fff1f2', icon: '#fecdd3', stroke: '#e11d48' },
  },
  {
    id: 'm25', label: 'Iron Will', days: 25,
    desc: '25 days. Discipline over motivation, always.',
    color: { bg: '#fefce8', icon: '#fef08a', stroke: '#ca8a04' },
  },
  {
    id: 'mfull', label: 'Full Month', days: 'full',
    desc: 'Every single day of the month. Absolute dedication.',
    color: { bg: '#0f172a', icon: '#1e293b', stroke: '#f8fafc' },
    special: true,
  },
];

const HOURS_TIERS = [
  {
    id: 'h1',   label: 'Off the Couch', hours: 1,
    desc: 'Your first full hour. Welcome to the grind.',
    color: { bg: '#f0fdf4', icon: '#bbf7d0', stroke: '#16a34a' },
  },
  {
    id: 'h10',  label: 'Getting Serious', hours: 10,
    desc: '10 hours in. You\'re not just trying anymore.',
    color: { bg: '#eff6ff', icon: '#bfdbfe', stroke: '#2563eb' },
  },
  {
    id: 'h25',  label: 'Committed', hours: 25,
    desc: 'A full day of training. You\'re all in.',
    color: { bg: '#faf5ff', icon: '#e9d5ff', stroke: '#9333ea' },
  },
  {
    id: 'h50',  label: 'Athlete', hours: 50,
    desc: '50 hours forged. The body is changing.',
    color: { bg: '#fff7ed', icon: '#fed7aa', stroke: '#ea580c' },
  },
  {
    id: 'h100', label: 'Century', hours: 100,
    desc: '100 hours of sweat. Most people never get here.',
    color: { bg: '#fff1f2', icon: '#fecdd3', stroke: '#e11d48' },
  },
  {
    id: 'h250', label: 'Legend', hours: 250,
    desc: '250 hours. Built different. No debate.',
    color: { bg: '#fefce8', icon: '#fef08a', stroke: '#ca8a04' },
  },
];

// ── SVG icons per track ───────────────────────────────────────────────────────

function MonthIcon({ stroke }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function HourIcon({ stroke }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Achievement card ──────────────────────────────────────────────────────────

function AchievementCard({ tier, unlocked, progress, total, IconComponent }) {
  const { color, label, desc, special } = tier;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition"
      style={unlocked
        ? { backgroundColor: color.bg, borderColor: color.icon }
        : { backgroundColor: '#f9fafb', borderColor: '#f3f4f6', opacity: 0.55 }
      }
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: unlocked ? color.icon : '#e5e7eb' }}
      >
        <IconComponent stroke={unlocked ? color.stroke : '#9ca3af'} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className={`text-sm font-bold truncate ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}
            style={unlocked && special ? { color: '#f8fafc' } : {}}>
            {label}
          </p>
          {unlocked && (
            <svg className="w-3.5 h-3.5 shrink-0" fill={color.stroke} viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-xs leading-snug truncate"
          style={{ color: unlocked ? (special ? '#94a3b8' : '#6b7280') : '#9ca3af' }}>
          {desc}
        </p>
        {!unlocked && total > 0 && (
          <div className="mt-1.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (progress / total) * 100)}%`,
                backgroundColor: color.stroke,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Achievements section ──────────────────────────────────────────────────────

function AchievementsSection({ bestMonthDays, totalHours, daysInBestMonth }) {
  const nextMonth = MONTH_TIERS.find((t) => {
    if (t.days === 'full') return bestMonthDays < daysInBestMonth;
    return bestMonthDays < t.days;
  });
  const nextHours = HOURS_TIERS.find((t) => totalHours < t.hours);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
      <h2 className="font-bold text-gray-900">Achievements</h2>

      {/* Monthly dedication */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Monthly dedication</p>
        <div className="space-y-2">
          {MONTH_TIERS.map((t) => {
            const unlocked = t.days === 'full'
              ? bestMonthDays >= daysInBestMonth && daysInBestMonth > 0
              : bestMonthDays >= t.days;
            const isNext = nextMonth?.id === t.id;
            const target = t.days === 'full' ? daysInBestMonth : t.days;
            return (
              <AchievementCard
                key={t.id}
                tier={t}
                unlocked={unlocked}
                progress={isNext ? bestMonthDays : 0}
                total={isNext ? target : 0}
                IconComponent={MonthIcon}
              />
            );
          })}
        </div>
      </div>

      {/* Total training hours */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total training</p>
        <div className="space-y-2">
          {HOURS_TIERS.map((t) => {
            const unlocked = totalHours >= t.hours;
            const isNext = nextHours?.id === t.id;
            return (
              <AchievementCard
                key={t.id}
                tier={t}
                unlocked={unlocked}
                progress={isNext ? totalHours : 0}
                total={isNext ? t.hours : 0}
                IconComponent={HourIcon}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcStreak(calendarData) {
  if (!calendarData || Object.keys(calendarData).length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(today);
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (calendarData[key]) { streak++; }
    else if (d.getTime() < today.getTime()) { break; }
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const { dashboard, fetchDashboard } = useSessionStore();
  const { routines, fetchRoutines } = useRoutineStore();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [stats, setStats] = useState({ totalMinutes: 0, bestMonthDays: 0, daysInBestMonth: 0 });
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    fetchRoutines();
    sessionsApi.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, [fetchDashboard, fetchRoutines]);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      setUser(data);
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditOpen(false); }, 1200);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const base64 = await resizeImage(file, 512, 0.85);
      const { data } = await authApi.updateProfile({ avatar: base64 });
      setUser(data);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/');
  }

  const totalWorkouts = dashboard?.totalCount ?? 0;
  const streak = calcStreak(calendarData);
  const totalHours = stats.totalMinutes / 60;

  return (
    <div className="space-y-5 pb-8">
      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full shrink-0 group"
            title="Change photo"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              {avatarUploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            {user?.bio && <p className="text-sm text-gray-500 mt-1 truncate">{user.bio}</p>}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-0 mt-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
            <p className="text-xs text-gray-400 mt-0.5">Workouts</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-primary-600">{streak}</p>
            <p className="text-xs text-gray-400 mt-0.5">Day streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{Math.floor(totalHours)}h</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
        </div>

        {/* Edit profile toggle */}
        <button
          onClick={() => setEditOpen((o) => !o)}
          className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          {editOpen ? 'Cancel' : 'Edit Profile'}
        </button>

        {/* Edit form */}
        {editOpen && (
          <form onSubmit={handleSave} className="mt-4 space-y-3 pt-4 border-t border-gray-50">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Describe yourself"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={isSaving}>Save Changes</Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Workout Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Activity</h2>
          <span className="text-xs text-gray-400">{totalWorkouts} total</span>
        </div>
        <WorkoutCalendar weeks={16} onData={setCalendarData} />
      </div>

      {/* Achievements */}
      <AchievementsSection
        bestMonthDays={stats.bestMonthDays}
        totalHours={totalHours}
        daysInBestMonth={stats.daysInBestMonth}
      />

      {/* Account actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {user?.isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Admin Panel</span>
            <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-red-500">Log Out</span>
        </button>
      </div>
    </div>
  );
}
