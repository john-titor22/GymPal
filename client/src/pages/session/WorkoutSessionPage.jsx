import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/ui/Button';

export function WorkoutSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { workoutDayId, dayName } = location.state || {};
  const { activeSession, startSession, logSet, completeSession, clearSession } = useSessionStore();

  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [setInputs, setSetInputs] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!workoutDayId) {
      navigate('/dashboard');
      return;
    }
    init();
    return () => clearInterval(timerRef.current);
  }, [workoutDayId]);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession?.id]);

  async function init() {
    if (activeSession) return;
    setIsStarting(true);
    try {
      await startSession(workoutDayId);
    } finally {
      setIsStarting(false);
    }
  }

  function getLogsForExercise(exerciseId) {
    return activeSession?.exerciseLogs.filter((l) => l.exerciseId === exerciseId) || [];
  }

  function getInput(exerciseId, setNum, field) {
    return setInputs[`${exerciseId}-${setNum}`]?.[field] ?? '';
  }

  function setInput(exerciseId, setNum, field, value) {
    const key = `${exerciseId}-${setNum}`;
    setSetInputs((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  }

  async function handleLogSet(exercise, setNum) {
    const key = `${exercise.id}-${setNum}`;
    const input = setInputs[key] || {};
    await logSet({
      exerciseId: exercise.id,
      setNumber: setNum,
      reps: Number(input.reps || exercise.reps),
      weight: input.weight ? Number(input.weight) : undefined,
    });
  }

  async function handleComplete() {
    setIsCompleting(true);
    try {
      await completeSession();
      navigate('/dashboard');
    } finally {
      setIsCompleting(false);
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  if (isStarting || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
        <p className="text-slate-400">Starting workout...</p>
      </div>
    );
  }

  const exercises = activeSession.workoutDay.exercises;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{activeSession.workoutDay.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{exercises.length} exercises</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-primary-500">{formatTime(elapsed)}</p>
          <p className="text-xs text-slate-500">elapsed</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const logs = getLogsForExercise(exercise.id);
          return (
            <div key={exercise.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
                  <p className="text-xs text-slate-500">
                    {exercise.muscleGroup.replace('_', ' ')} · Target: {exercise.sets}×{exercise.reps}
                    {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                  </p>
                </div>
                <span className="text-xs font-medium text-primary-500 bg-primary-500/10 px-2 py-1 rounded-full">
                  {logs.length}/{exercise.sets} sets
                </span>
              </div>

              {/* Set rows */}
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1">
                  <span className="text-xs text-slate-500">Set</span>
                  <span className="text-xs text-slate-500">Reps</span>
                  <span className="text-xs text-slate-500">Weight (kg)</span>
                  <span />
                </div>

                {Array.from({ length: exercise.sets }).map((_, i) => {
                  const setNum = i + 1;
                  const logged = logs.find((l) => l.setNumber === setNum);
                  return (
                    <div key={setNum} className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center ${logged ? 'opacity-60' : ''}`}>
                      <span className="text-sm text-slate-400 font-medium">{setNum}</span>
                      <input
                        type="number"
                        className="input text-sm py-1.5"
                        placeholder={String(exercise.reps)}
                        value={logged ? logged.reps : getInput(exercise.id, setNum, 'reps')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'reps', e.target.value)}
                        readOnly={!!logged}
                      />
                      <input
                        type="number"
                        className="input text-sm py-1.5"
                        placeholder={exercise.weight ? String(exercise.weight) : '—'}
                        value={logged ? (logged.weight ?? '') : getInput(exercise.id, setNum, 'weight')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'weight', e.target.value)}
                        readOnly={!!logged}
                      />
                      {logged ? (
                        <div className="flex items-center justify-center text-primary-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLogSet(exercise, setNum)}
                          className="w-9 h-9 rounded-lg bg-surface-700 hover:bg-primary-600 text-slate-300 hover:text-white transition flex items-center justify-center text-lg font-bold"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {exercise.notes && (
                <p className="text-xs text-slate-500 mt-3 border-t border-surface-700 pt-3">
                  Note: {exercise.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-surface-800 border-t border-surface-700 p-4 flex gap-3 items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">{dayName}</p>
          <p className="text-xs text-slate-500">{formatTime(elapsed)} elapsed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => { clearSession(); navigate(-1); }}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={isCompleting} onClick={handleComplete}>
            Finish Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
