import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/ui/Button';
import { ExerciseImage } from '../../components/ui/ExerciseImage';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

const IMG_MAP = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.name, e.images]));

// Per-set stopwatch — independent, persists while parent re-renders
function SetTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function toggle() { setRunning((r) => !r); }
  function reset() { setRunning(false); setSeconds(0); }

  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-mono font-semibold w-10 text-right ${running ? 'text-primary-600' : 'text-gray-400'}`}>
        {m}:{s}
      </span>
      <button
        onClick={toggle}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
          running
            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        {running ? (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      {seconds > 0 && (
        <button
          onClick={reset}
          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function WorkoutSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { routineId, routineName } = location.state || {};
  const { activeSession, startSession, logSet, completeSession, cancelSession } = useSessionStore();

  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);
  const [setInputs, setSetInputs] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!routineId) { navigate('/dashboard'); return; }
    init();
    return () => clearInterval(timerRef.current);
  }, [routineId]);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession?.id]);

  async function init() {
    if (activeSession) return;
    setIsStarting(true);
    try { await startSession(routineId); }
    finally { setIsStarting(false); }
  }

  function getLogsForExercise(exerciseId) {
    return activeSession?.exerciseLogs.filter((l) => l.exerciseId === exerciseId) || [];
  }

  function getInput(exerciseId, setNum, field) {
    return setInputs[`${exerciseId}-${setNum}`]?.[field] ?? '';
  }

  function setInput(exerciseId, setNum, field, value) {
    const key = `${exerciseId}-${setNum}`;
    setSetInputs((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }));
  }

  async function handleLogSet(exercise, setNum) {
    const input = setInputs[`${exercise.id}-${setNum}`] || {};
    const template = Array.isArray(exercise.setsData) ? exercise.setsData[setNum - 1] : null;
    const defaultReps = template?.reps ?? exercise.reps;
    const defaultWeight = template?.weight ?? exercise.weight;
    await logSet({
      exerciseId: exercise.id,
      setNumber: setNum,
      reps: Number(input.reps || defaultReps || 0),
      weight: input.weight ? Number(input.weight) : (defaultWeight ? Number(defaultWeight) : undefined),
    });
  }

  async function handleComplete() {
    setIsCompleting(true);
    setCompleteError(null);
    try {
      await completeSession();
      clearInterval(timerRef.current);
      setDone(true);
    } catch (err) {
      setCompleteError('Failed to finish workout. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Complete!</h1>
          <p className="text-gray-500 mt-1">{routineName}</p>
          <p className="text-3xl font-mono font-bold text-primary-600 mt-3">{formatTime(elapsed)}</p>
          <p className="text-sm text-gray-400">Total time</p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isStarting || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full" />
        <p className="text-gray-400 text-sm">Starting workout...</p>
      </div>
    );
  }

  const exercises = activeSession.routine.exercises;
  const totalLogged = exercises.reduce((t, ex) => t + getLogsForExercise(ex.id).length, 0);
  const totalSets = exercises.reduce((t, ex) => t + ex.sets, 0);
  const allDone = totalLogged >= totalSets && totalSets > 0;

  return (
    <div className="space-y-4 pb-40 md:pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activeSession.routine.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{exercises.length} exercises · {totalLogged}/{totalSets} sets</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-primary-600">{formatTime(elapsed)}</p>
          <p className="text-xs text-gray-400">elapsed</p>
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-green-700">All sets complete — tap Finish Workout!</p>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const logs = getLogsForExercise(exercise.id);
          const exDone = logs.length >= exercise.sets;
          return (
            <div key={exercise.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <ExerciseImage images={IMG_MAP[exercise.name]} size="md" />
                  <div>
                    <h3 className="font-bold text-gray-900">{exercise.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {exercise.equipment ? `${exercise.equipment} · ` : ''}
                      {exercise.sets} sets
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${exDone ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>
                  {logs.length}/{exercise.sets}
                </span>
              </div>

              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_auto_2.5rem] gap-2 px-1">
                  <span className="text-xs font-medium text-gray-400">SET</span>
                  <span className="text-xs font-medium text-gray-400">KG</span>
                  <span className="text-xs font-medium text-gray-400">REPS</span>
                  <span className="text-xs font-medium text-gray-400">TIMER</span>
                  <span />
                </div>

                {Array.from({ length: exercise.sets }).map((_, i) => {
                  const setNum = i + 1;
                  const logged = logs.find((l) => l.setNumber === setNum);
                  const template = Array.isArray(exercise.setsData) ? exercise.setsData[i] : null;
                  const weightPH = template?.weight != null ? String(template.weight) : (exercise.weight ? String(exercise.weight) : '—');
                  const repsPH = template?.reps != null && template.reps > 0 ? String(template.reps) : (exercise.reps > 0 ? String(exercise.reps) : '—');
                  return (
                    <div key={setNum} className={`grid grid-cols-[2rem_1fr_1fr_auto_2.5rem] gap-2 items-center ${logged ? 'opacity-50' : ''}`}>
                      <span className="text-sm font-semibold text-gray-500">{setNum}</span>
                      <input type="number" className="input text-sm py-2"
                        placeholder={weightPH}
                        value={logged ? (logged.weight ?? '') : getInput(exercise.id, setNum, 'weight')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'weight', e.target.value)}
                        readOnly={!!logged}
                      />
                      <input type="number" className="input text-sm py-2"
                        placeholder={repsPH}
                        value={logged ? logged.reps : getInput(exercise.id, setNum, 'reps')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'reps', e.target.value)}
                        readOnly={!!logged}
                      />
                      <SetTimer />
                      {logged ? (
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLogSet(exercise, setNum)}
                          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-primary-600 text-gray-500 hover:text-white transition flex items-center justify-center font-bold text-base"
                        >✓</button>
                      )}
                    </div>
                  );
                })}
              </div>

              {exercise.notes && (
                <div className="px-4 pb-4 pt-1">
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">Note: {exercise.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish bar */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 md:left-56 z-50 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        {completeError && <p className="text-xs text-red-500 text-center mb-2">{completeError}</p>}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{routineName}</p>
            <p className="text-xs text-gray-400">{formatTime(elapsed)} elapsed</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { cancelSession(); navigate(-1); }}>Cancel</Button>
            <Button
              isLoading={isCompleting}
              onClick={handleComplete}
              className={allDone ? 'ring-2 ring-green-400 ring-offset-1' : ''}
            >
              Finish Workout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
