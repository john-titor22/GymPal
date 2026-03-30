import { useEffect, useState } from 'react';
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
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (calendarData[key]) { streak++; }
    else if (d.getTime() < today.getTime()) { break; }
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useSessionStore();
  const { routines, fetchRoutines } = useRoutineStore();
  const navigate = useNavigate();

  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    fetchDashboard();
    fetchRoutines();
  }, [fetchDashboard, fetchRoutines]);

  const { weekCount, totalCount } = dashboard || {};
  const streak = calcStreak(calendarData);

  return (
    <div className="space-y-4 pb-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-gray-900">{weekCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">This week</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-primary-600">{streak}</p>
          <p className="text-xs text-gray-400 mt-0.5">Day streak</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">All time</p>
        </div>
      </div>

      {/* Activity calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Activity</h2>
          <span className="text-xs text-gray-400">{totalCount ?? 0} total workouts</span>
        </div>
        <WorkoutCalendar weeks={16} onData={setCalendarData} />
      </div>

      {/* Start workout */}
      {routines.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Start Workout</h2>
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
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">No routines yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a routine to start training</p>
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
