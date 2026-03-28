import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useSessionStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { activeProgram, recentSessions, weekCount } = dashboard || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Hey, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-400 mt-1">Ready to crush today's workout?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="This Week" value={`${weekCount ?? 0} workouts`} color="green" />
        <StatCard label="Active Program" value={activeProgram?.name ?? 'None'} color="blue" />
        <StatCard label="Goal" value={user?.fitnessGoal ?? '—'} color="yellow" />
      </div>

      {/* Active program / today's workout */}
      {activeProgram ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Active Program</h2>
            <Link to={`/programs/${activeProgram.id}`} className="text-xs text-primary-500 hover:text-primary-400">
              View program
            </Link>
          </div>
          <p className="text-sm text-slate-400 mb-4">{activeProgram.name} · {activeProgram.durationWeeks} weeks</p>
          <div className="grid gap-3">
            {activeProgram.workoutDays.map((day) => (
              <div key={day.id} className="flex items-center justify-between bg-surface-900 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">{day.name}</p>
                  <p className="text-xs text-slate-500">{day.exercises?.length ?? 0} exercises</p>
                </div>
                <Button
                  variant="primary"
                  className="text-sm py-1.5 px-3"
                  onClick={() => navigate('/session', { state: { workoutDayId: day.id, dayName: day.name } })}
                >
                  Start
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center py-10 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-2xl">🏋️</div>
          <div>
            <p className="font-medium text-slate-200">No active program</p>
            <p className="text-sm text-slate-500 mt-1">Create a program and activate it to get started</p>
          </div>
          <Button onClick={() => navigate('/programs')}>Browse Programs</Button>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-100 mb-4">Recent Workouts</h2>
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{s.workoutDay?.name}</p>
                  <p className="text-xs text-slate-500">{new Date(s.startedAt).toLocaleDateString()}</p>
                </div>
                <Badge color={s.completedAt ? 'green' : 'yellow'}>
                  {s.completedAt ? 'Completed' : 'Incomplete'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    green: 'text-primary-500',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  };
  return (
    <div className="card">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}
