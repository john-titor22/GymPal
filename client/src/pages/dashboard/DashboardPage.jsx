import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';
import { useRoutineStore } from '../../store/routineStore';
import { WorkoutCalendar } from '../../components/ui/WorkoutCalendar';

function calcStreak(calendarData) {
  if (!calendarData || Object.keys(calendarData).length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(today);
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (calendarData[key]) { streak++; }
    else if (d.getTime() < today.getTime()) { break; }
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

function streakMessage(streak) {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start — keep it going!";
  if (streak < 7) return "Building momentum!";
  if (streak < 14) return "One week strong — don't stop now!";
  if (streak < 30) return "You're on fire!";
  return "Legendary consistency!";
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { dashboard, calendar, isLoading, fetchDashboard, fetchCalendar } = useSessionStore();
  const { routines, fetchRoutines } = useRoutineStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchCalendar();
    fetchRoutines();
  }, [fetchDashboard, fetchCalendar, fetchRoutines]);

  const { weekCount, totalCount } = dashboard || {};
  const streak = calcStreak(calendar);

  return (
    <div className="space-y-4 pb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hey {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Ready to train?</p>
      </div>

      {/* Streak hero card */}
      <div className={`rounded-2xl px-5 py-5 text-white relative overflow-hidden ${streak > 0 ? 'bg-gradient-to-br from-primary-600 to-primary-700' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-2 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/20 shrink-0">
            <span className="text-2xl">{streak > 0 ? '🔥' : '💪'}</span>
          </div>
          <div>
            <p className="text-4xl font-black leading-none">{streak}</p>
            <p className="text-white/80 text-sm font-semibold mt-0.5">
              {streak === 1 ? 'day streak' : 'day streak'}
            </p>
            <p className="text-white/60 text-xs mt-1">{streakMessage(streak)}</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-gray-900">{weekCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">This week</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-primary-600">{totalCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">All time</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Routines</p>
        </div>
      </div>

      {/* Activity calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Your Activity</h2>
          <span className="text-xs text-gray-400">{totalCount ?? 0} workouts</span>
        </div>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <WorkoutCalendar data={calendar} weeks={16} />
        )}
      </div>

      {/* Quick start */}
      {routines.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Quick Start</h2>
            <Link to="/routines" className="text-xs text-primary-600 font-semibold">See all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {routines.slice(0, 4).map((routine) => (
              <div key={routine.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{routine.name}</p>
                  <p className="text-xs text-gray-400">
                    {routine.exercises.length} exercises · {routine.exercises.reduce((t, e) => t + e.sets, 0)} sets
                  </p>
                </div>
                <button
                  onClick={() => navigate('/session', { state: { routineId: routine.id, routineName: routine.name } })}
                  className="text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-1.5 rounded-xl transition"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-12 gap-3 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl">🏋️</div>
          <div>
            <p className="font-semibold text-gray-900">No routines yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first routine to start training</p>
          </div>
          <button
            onClick={() => navigate('/routines')}
            className="mt-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition"
          >
            Create Routine
          </button>
        </div>
      )}
    </div>
  );
}
