import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';
import { useRoutineStore } from '../../store/routineStore';
import { Badge } from '../../components/ui/Badge';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useSessionStore();
  const { routines, fetchRoutines } = useRoutineStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchRoutines();
  }, [fetchDashboard, fetchRoutines]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { recentSessions, weekCount, totalCount } = dashboard || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello {user?.name?.split(' ')[0]}, welcome to GymPal!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your training overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{weekCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">This week</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{totalCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{routines.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Routines</p>
        </div>
      </div>

      {/* Start workout */}
      {routines.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
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
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">🏋️</div>
          <div>
            <p className="font-semibold text-gray-900">No routines yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a routine to start working out</p>
          </div>
          <button
            onClick={() => navigate('/routines')}
            className="mt-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition"
          >
            Create Routine
          </button>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Workouts</h2>
            <Link to="/history" className="text-xs text-primary-600 font-semibold">See all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.routine?.name ?? 'Workout'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.startedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}{s._count?.exerciseLogs ?? 0} sets
                  </p>
                </div>
                <Badge color={s.completedAt ? 'green' : 'yellow'}>
                  {s.completedAt ? 'Done' : 'In progress'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
