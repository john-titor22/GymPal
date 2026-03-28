import { useEffect, useState } from 'react';
import { sessionsApi } from '../../api/sessions.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load(cursor) {
    if (!cursor) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const { data } = await sessionsApi.getAll(cursor, 10);
      setSessions((prev) => cursor ? [...prev, ...data.sessions] : data.sessions);
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">History</h1>
        <p className="text-slate-400 text-sm mt-1">All your past workouts</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-3 text-center">
          <div className="text-4xl">📭</div>
          <p className="text-slate-400 text-sm">No workouts logged yet. Start one from the dashboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">{s.workoutDay?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(s.startedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {s.completedAt && ` · ${Math.round((new Date(s.completedAt) - new Date(s.startedAt)) / 60000)} min`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{s._count?.exerciseLogs ?? 0} sets</span>
                <Badge color={s.completedAt ? 'green' : 'yellow'}>
                  {s.completedAt ? 'Done' : 'Incomplete'}
                </Badge>
              </div>
            </div>
          ))}

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" isLoading={isLoadingMore} onClick={() => load(nextCursor)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
