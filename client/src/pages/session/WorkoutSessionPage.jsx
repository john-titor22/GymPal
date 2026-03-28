import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/ui/Button';
import { ExerciseImage } from '../../components/ui/ExerciseImage';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

const IMG_MAP = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.name, e.images]));

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
    await logSet({
      exerciseId: exercise.id,
      setNumber: setNum,
      reps: Number(input.reps || exercise.reps),
      weight: input.weight ? Number(input.weight) : undefined,
    });
  }

  async function handleComplete() {
    setIsCompleting(true);
    setCompleteError(null);
    try {
      await completeSession();
      navigate('/dashboard');
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

  if (isStarting || !activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full" />
        <p className="text-gray-400 text-sm">Starting workout...</p>
      </div>
    );
  }

  const exercises = activeSession.routine.exercises;

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activeSession.routine.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{exercises.length} exercises</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-primary-600">{formatTime(elapsed)}</p>
          <p className="text-xs text-gray-400">elapsed</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const logs = getLogsForExercise(exercise.id);
          const allDone = logs.length >= exercise.sets;
          return (
            <div key={exercise.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <ExerciseImage images={IMG_MAP[exercise.name]} size="md" />
                  <div>
                    <h3 className="font-bold text-gray-900">{exercise.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Target: {exercise.sets}×{exercise.reps}
                      {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                      {exercise.equipment ? ` · ${exercise.equipment}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${allDone ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>
                  {logs.length}/{exercise.sets}
                </span>
              </div>

              {/* Set rows */}
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1">
                  <span className="text-xs font-medium text-gray-400">SET</span>
                  <span className="text-xs font-medium text-gray-400">KG</span>
                  <span className="text-xs font-medium text-gray-400">REPS</span>
                  <span />
                </div>

                {Array.from({ length: exercise.sets }).map((_, i) => {
                  const setNum = i + 1;
                  const logged = logs.find((l) => l.setNumber === setNum);
                  return (
                    <div key={setNum} className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center ${logged ? 'opacity-50' : ''}`}>
                      <span className="text-sm font-semibold text-gray-500">{setNum}</span>
                      <input
                        type="number"
                        className="input text-sm py-2"
                        placeholder={exercise.weight ? String(exercise.weight) : '—'}
                        value={logged ? (logged.weight ?? '') : getInput(exercise.id, setNum, 'weight')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'weight', e.target.value)}
                        readOnly={!!logged}
                      />
                      <input
                        type="number"
                        className="input text-sm py-2"
                        placeholder={String(exercise.reps)}
                        value={logged ? logged.reps : getInput(exercise.id, setNum, 'reps')}
                        onChange={(e) => !logged && setInput(exercise.id, setNum, 'reps', e.target.value)}
                        readOnly={!!logged}
                      />
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
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {exercise.notes && (
                <div className="px-4 pb-4 pt-1">
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Note: {exercise.notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        {completeError && (
          <p className="text-xs text-red-500 text-center mb-2">{completeError}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{routineName}</p>
            <p className="text-xs text-gray-400">{formatTime(elapsed)} elapsed</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { cancelSession(); navigate(-1); }}>Cancel</Button>
            <Button isLoading={isCompleting} onClick={handleComplete}>Finish Workout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
