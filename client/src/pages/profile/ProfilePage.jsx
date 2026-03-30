import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import { useRoutineStore } from '../../store/routineStore';
import { authApi } from '../../api/auth.api';
import { WorkoutCalendar } from '../../components/ui/WorkoutCalendar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resizeImage } from '../../utils/imageResize';

function calcStreak(calendarData) {
  if (!calendarData || Object.keys(calendarData).length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(today);
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (calendarData[key]) { streak++; }
    else if (d.getTime() < today.getTime()) { break; }
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

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
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    fetchRoutines();
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
            <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Routines</p>
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
