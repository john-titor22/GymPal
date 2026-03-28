import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutineStore } from '../../store/routineStore';
import { Button } from '../../components/ui/Button';
import { BodyDiagram } from '../../components/ui/BodyDiagram';
import { EXERCISE_LIBRARY, MUSCLE_OPTIONS, EQUIPMENT_OPTIONS } from '../../data/exerciseLibrary';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', LEGS: 'Legs', GLUTES: 'Glutes', CORE: 'Core',
  FULL_BODY: 'Full Body', OTHER: 'Other',
};

export function RoutineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRoutine, isLoading, fetchRoutineById, addExercise, removeExercise } = useRoutineStore();

  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchRoutineById(id); }, [id, fetchRoutineById]);

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
      const matchEquip = !filterEquipment || filterEquipment === 'All Equipment' || ex.equipment === filterEquipment;
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [search, filterMuscle, filterEquipment]);

  async function handlePickExercise(ex) {
    setIsSubmitting(true);
    try {
      await addExercise(id, { name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(exerciseId) {
    await removeExercise(id, exerciseId);
  }

  if (isLoading || !currentRoutine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalSets = currentRoutine.exercises.reduce((t, e) => t + e.sets, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/routines')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Routines
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{currentRoutine.name}</h1>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Summary</p>
          <div className="flex gap-6 mt-2">
            <div>
              <p className="text-xl font-bold text-gray-900">{currentRoutine.exercises.length}</p>
              <p className="text-xs text-gray-400">Exercises</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-600">{totalSets}</p>
              <p className="text-xs text-gray-400">Total Sets</p>
            </div>
          </div>
          {currentRoutine.exercises.length > 0 && (
            <button
              onClick={() => navigate('/session', { state: { routineId: id, routineName: currentRoutine.name } })}
              className="mt-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition"
            >
              Start Workout
            </button>
          )}
        </div>
        {currentRoutine.exercises.length > 0 && (
          <BodyDiagram
            muscleGroup={currentRoutine.exercises[0]?.muscleGroup || 'OTHER'}
            size="md"
          />
        )}
      </div>

      {/* Exercise list */}
      {currentRoutine.exercises.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-14 gap-3 text-center">
          <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="font-semibold text-gray-900">No Exercises</p>
          <p className="text-sm text-gray-500">So far, you haven't added any exercises to this routine.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {currentRoutine.exercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ex.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {MUSCLE_LABEL[ex.muscleGroup] || ex.muscleGroup}
                    {ex.equipment ? ` · ${ex.equipment}` : ''}
                    {' · '}{ex.sets} sets × {ex.reps} reps
                    {ex.weight ? ` @ ${ex.weight}kg` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(ex.id)}
                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Exercise button */}
      <button
        onClick={() => setShowPicker(true)}
        className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Exercise
      </button>

      {/* Exercise Picker drawer */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPicker(false)} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Select Exercise</h2>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Filters */}
            <div className="px-4 pt-3 pb-2 space-y-2">
              <input
                type="text"
                className="input w-full"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input text-sm"
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                >
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <option key={eq} value={eq === 'All Equipment' ? '' : eq}>{eq}</option>
                  ))}
                </select>
                <select
                  className="input text-sm"
                  value={filterMuscle}
                  onChange={(e) => setFilterMuscle(e.target.value)}
                >
                  {MUSCLE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filtered.map((ex) => (
                <button
                  key={ex.name}
                  disabled={isSubmitting}
                  onClick={() => handlePickExercise(ex)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <BodyDiagram muscleGroup={ex.muscleGroup} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-400">{MUSCLE_LABEL[ex.muscleGroup]}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No exercises found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
