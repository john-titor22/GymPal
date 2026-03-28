import { useEffect, useState } from 'react';
import { sessionsApi } from '../../api/sessions.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => { load(); }, []);

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
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <p className="text-sm text-gray-500 mt-1">All your past workouts</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">📭</div>
          <p className="font-semibold text-gray-900">No workouts yet</p>
          <p className="text-sm text-gray-500">Start a workout from the home screen!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="font-semibold text-gray-900">{s.routine?.name ?? 'Workout'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(s.startedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {s.completedAt && ` · ${Math.round((new Date(s.completedAt) - new Date(s.startedAt)) / 60000)} min`}
                  {` · ${s._count?.exerciseLogs ?? 0} sets`}
                </p>
              </div>
              <Badge color={s.completedAt ? 'green' : 'yellow'}>
                {s.completedAt ? 'Done' : 'Incomplete'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" isLoading={isLoadingMore} onClick={() => load(nextCursor)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
