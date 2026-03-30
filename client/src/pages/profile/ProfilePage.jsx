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
  { id: 'm1',  label: 'First Steps',  days: 1,  desc: '1 day in a month' },
  { id: 'm5',  label: 'Regular',      days: 5,  desc: '5 days in a month' },
  { id: 'm10', label: 'Dedicated',    days: 10, desc: '10 days in a month' },
  { id: 'm15', label: 'Consistent',   days: 15, desc: '15 days in a month' },
  { id: 'm20', label: 'Unstoppable',  days: 20, desc: '20 days in a month' },
  { id: 'm25', label: 'Iron Will',    days: 25, desc: '25 days in a month' },
];

const HOURS_TIERS = [
  { id: 'h1',   label: 'First Hour',   hours: 1,   desc: '1 hour total' },
  { id: 'h10',  label: 'In the Zone',  hours: 10,  desc: '10 hours total' },
  { id: 'h25',  label: 'Committed',    hours: 25,  desc: '25 hours total' },
  { id: 'h50',  label: 'Athlete',      hours: 50,  desc: '50 hours total' },
  { id: 'h100', label: 'Champion',     hours: 100, desc: '100 hours total' },
  { id: 'h250', label: 'Legend',       hours: 250, desc: '250 hours total' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function CalendarIcon({ unlocked }) {
  const c = unlocked ? '#2563eb' : '#d1d5db';
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon({ unlocked }) {
  const c = unlocked ? '#2563eb' : '#d1d5db';
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Achievement card ──────────────────────────────────────────────────────────

function AchievementCard({ label, desc, unlocked, progress, total, Icon }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition ${
      unlocked ? 'border-primary-100 bg-primary-50/40' : 'border-gray-100 bg-white opacity-60'
    }`}>
      {/* Icon circle */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        unlocked ? 'bg-primary-100' : 'bg-gray-100'
      }`}>
        <Icon unlocked={unlocked} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-bold truncate ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
            {label}
          </p>
          {unlocked && (
            <svg className="w-3.5 h-3.5 text-primary-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
        {/* Progress bar for next locked achievement */}
        {!unlocked && total > 0 && (
          <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-300 rounded-full transition-all"
              style={{ width: `${Math.min(100, (progress / total) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Achievements section ──────────────────────────────────────────────────────

function AchievementsSection({ bestMonthDays, totalHours }) {
  const nextMonth = MONTH_TIERS.find((t) => bestMonthDays < t.days);
  const nextHours = HOURS_TIERS.find((t) => totalHours < t.hours);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
      <h2 className="font-bold text-gray-900">Achievements</h2>

      {/* Monthly dedication */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Monthly dedication</p>
        <div className="grid grid-cols-1 gap-2">
          {MONTH_TIERS.map((t) => {
            const unlocked = bestMonthDays >= t.days;
            const isNext = nextMonth?.id === t.id;
            return (
              <AchievementCard
                key={t.id}
                label={t.label}
                desc={t.desc}
                unlocked={unlocked}
                progress={isNext ? bestMonthDays : 0}
                total={isNext ? t.days : 0}
                Icon={CalendarIcon}
              />
            );
          })}
        </div>
      </div>

      {/* Total training hours */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total training</p>
        <div className="grid grid-cols-1 gap-2">
          {HOURS_TIERS.map((t) => {
            const unlocked = totalHours >= t.hours;
            const isNext = nextHours?.id === t.id;
            return (
              <AchievementCard
                key={t.id}
                label={t.label}
                desc={t.desc}
                unlocked={unlocked}
                progress={isNext ? totalHours : 0}
                total={isNext ? t.hours : 0}
                Icon={ClockIcon}
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
  const [stats, setStats] = useState({ totalMinutes: 0, bestMonthDays: 0 });
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
      <AchievementsSection bestMonthDays={stats.bestMonthDays} totalHours={totalHours} />

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
