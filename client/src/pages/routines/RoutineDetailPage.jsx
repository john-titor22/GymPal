import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutineStore } from '../../store/routineStore';
import { BodyDiagram } from '../../components/ui/BodyDiagram';
import { ExerciseImage } from '../../components/ui/ExerciseImage';
import { EXERCISE_LIBRARY, MUSCLE_OPTIONS, EQUIPMENT_OPTIONS } from '../../data/exerciseLibrary';

const IMG_MAP = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.name, e.images]));

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', LEGS: 'Legs', GLUTES: 'Glutes', CORE: 'Core',
  FULL_BODY: 'Full Body', OTHER: 'Other',
};

const REST_OPTIONS = [
  { label: 'Off', value: '' },
  { label: '30s', value: '30' },
  { label: '1:00', value: '60' },
  { label: '1:30', value: '90' },
  { label: '2:00', value: '120' },
  { label: '3:00', value: '180' },
  { label: '5:00', value: '300' },
];

const SET_TYPES = [
  { value: 'warmup',  label: 'Warm up', badge: 'W', bg: 'bg-amber-100',  text: 'text-amber-600' },
  { value: 'normal',  label: 'Normal',  badge: null, bg: 'bg-gray-100',   text: 'text-gray-600'  },
  { value: 'failure', label: 'Failure', badge: 'F', bg: 'bg-red-100',    text: 'text-red-500'   },
  { value: 'drop',    label: 'Drop',    badge: 'D', bg: 'bg-blue-100',   text: 'text-blue-500'  },
];

function getSetTypeMeta(type) {
  return SET_TYPES.find((t) => t.value === type) || SET_TYPES[1];
}

function normaliseSetTypes(rawTypes, count) {
  const arr = Array.isArray(rawTypes) ? rawTypes : [];
  return Array.from({ length: count }, (_, i) => arr[i] || 'normal');
}

export function RoutineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRoutine, isLoading, fetchRoutineById, addExercise, updateExercise, removeExercise } = useRoutineStore();

  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localData, setLocalData] = useState({});
  // { exerciseId-setIndex } → popover open
  const [openTypeMenu, setOpenTypeMenu] = useState(null);
  const typeMenuRef = useRef(null);

  useEffect(() => { fetchRoutineById(id); }, [id, fetchRoutineById]);

  useEffect(() => {
    if (!currentRoutine) return;
    setLocalData((prev) => {
      const next = { ...prev };
      currentRoutine.exercises.forEach((ex) => {
        if (!next[ex.id]) {
          next[ex.id] = {
            sets: ex.sets,
            setTypes: normaliseSetTypes(ex.setTypes, ex.sets),
            reps: ex.reps > 0 ? String(ex.reps) : '',
            weight: ex.weight != null ? String(ex.weight) : '',
            notes: ex.notes ?? '',
            restTimer: ex.restTimer ? String(ex.restTimer) : '',
          };
        }
      });
      Object.keys(next).forEach((k) => {
        if (!currentRoutine.exercises.find((e) => e.id === k)) delete next[k];
      });
      return next;
    });
  }, [currentRoutine?.exercises.length, currentRoutine?.id]);

  // Close type menu on outside click
  useEffect(() => {
    if (!openTypeMenu) return;
    function handleClick(e) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setOpenTypeMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openTypeMenu]);

  const filtered = useMemo(() => EXERCISE_LIBRARY.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
    const matchEquip = !filterEquipment || filterEquipment === 'All Equipment' || ex.equipment === filterEquipment;
    return matchSearch && matchMuscle && matchEquip;
  }), [search, filterMuscle, filterEquipment]);

  function setField(exerciseId, field, value) {
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], [field]: value } }));
  }

  async function handleBlur(exerciseId, field) {
    const val = localData[exerciseId]?.[field];
    const payload = {};
    if (field === 'notes') payload.notes = val || null;
    else if (field === 'reps') payload.reps = val === '' ? 0 : Math.max(0, Number(val));
    else if (field === 'weight') payload.weight = val === '' ? null : Number(val);
    await updateExercise(id, exerciseId, payload);
  }

  async function handleRestTimer(exerciseId, value) {
    setField(exerciseId, 'restTimer', value);
    await updateExercise(id, exerciseId, { restTimer: value === '' ? null : Number(value) });
  }

  async function handleAddSet(exerciseId) {
    const local = localData[exerciseId] || {};
    const newSets = (local.sets || 1) + 1;
    const newTypes = [...(local.setTypes || []), 'normal'];
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], sets: newSets, setTypes: newTypes } }));
    await updateExercise(id, exerciseId, { sets: newSets, setTypes: newTypes });
  }

  async function handleRemoveSet(exerciseId) {
    const local = localData[exerciseId] || {};
    if ((local.sets || 1) <= 1) return;
    const newSets = local.sets - 1;
    const newTypes = (local.setTypes || []).slice(0, newSets);
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], sets: newSets, setTypes: newTypes } }));
    await updateExercise(id, exerciseId, { sets: newSets, setTypes: newTypes });
  }

  async function handleSetType(exerciseId, setIndex, typeValue) {
    const local = localData[exerciseId] || {};
    const newTypes = (local.setTypes || []).map((t, i) => i === setIndex ? typeValue : t);
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], setTypes: newTypes } }));
    setOpenTypeMenu(null);
    await updateExercise(id, exerciseId, { setTypes: newTypes });
  }

  async function handlePickExercise(ex) {
    setIsSubmitting(true);
    try {
      await addExercise(id, { name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !currentRoutine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalSets = currentRoutine.exercises.reduce((t, e) => t + (localData[e.id]?.sets ?? e.sets), 0);
  const primaryMuscle = currentRoutine.exercises[0]?.muscleGroup || 'OTHER';

  return (
    <div className="space-y-4 pb-8">
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
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
          <div className="flex gap-6">
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
          <BodyDiagram muscleGroup={primaryMuscle} size="md" />
        )}
      </div>

      {/* Exercise cards */}
      {currentRoutine.exercises.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-14 gap-3 text-center">
          <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="font-semibold text-gray-900">No Exercises Yet</p>
          <p className="text-sm text-gray-500">Tap "Add Exercise" to build your routine.</p>
        </div>
      ) : (
        currentRoutine.exercises.map((ex) => {
          const local = localData[ex.id] || { sets: ex.sets, setTypes: [], reps: '', weight: '', notes: '', restTimer: '' };
          const setTypes = normaliseSetTypes(local.setTypes, local.sets);
          return (
            <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Exercise header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                <ExerciseImage images={IMG_MAP[ex.name]} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{ex.name}</p>
                  <p className="text-xs text-gray-400">
                    {MUSCLE_LABEL[ex.muscleGroup]}{ex.equipment ? ` · ${ex.equipment}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => removeExercise(id, ex.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition text-xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="px-4 py-3 space-y-3">
                {/* Note */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Note</p>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 bg-gray-50 placeholder-gray-300"
                    placeholder="Add pinned note"
                    value={local.notes}
                    onChange={(e) => setField(ex.id, 'notes', e.target.value)}
                    onBlur={() => handleBlur(ex.id, 'notes')}
                  />
                </div>

                {/* Rest Timer */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rest Timer</p>
                  <select
                    className="w-40 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 bg-gray-50"
                    value={local.restTimer}
                    onChange={(e) => handleRestTimer(ex.id, e.target.value)}
                  >
                    {REST_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sets table */}
                <div>
                  <div className="grid grid-cols-[2.5rem_1fr_1fr_2rem] gap-2 px-1 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Set</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">KG</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reps</span>
                    <span />
                  </div>

                  {setTypes.map((type, i) => {
                    const meta = getSetTypeMeta(type);
                    const menuKey = `${ex.id}-${i}`;
                    const isMenuOpen = openTypeMenu === menuKey;
                    return (
                      <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr_2rem] gap-2 items-center mb-2">
                        {/* Set badge — tap to change type */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenTypeMenu(isMenuOpen ? null : menuKey)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition ${meta.bg} ${meta.text}`}
                          >
                            {meta.badge ?? (i + 1)}
                          </button>

                          {/* Type picker popover */}
                          {isMenuOpen && (
                            <div
                              ref={typeMenuRef}
                              className="absolute left-0 top-full mt-1 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 w-40"
                            >
                              {SET_TYPES.map((t) => (
                                <button
                                  key={t.value}
                                  onClick={() => handleSetType(ex.id, i, t.value)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition"
                                >
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${t.bg} ${t.text}`}>
                                    {t.badge ?? (i + 1)}
                                  </span>
                                  <span className="text-sm font-medium text-gray-700">{t.label}</span>
                                  {type === t.value && (
                                    <svg className="w-4 h-4 text-primary-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          type="number"
                          min="0"
                          className="h-9 w-full border border-gray-200 rounded-xl px-2 text-sm text-center focus:outline-none focus:border-primary-400 bg-gray-50 placeholder-gray-300"
                          placeholder="—"
                          value={local.weight}
                          onChange={(e) => setField(ex.id, 'weight', e.target.value)}
                          onBlur={() => handleBlur(ex.id, 'weight')}
                        />
                        <input
                          type="number"
                          min="0"
                          className="h-9 w-full border border-gray-200 rounded-xl px-2 text-sm text-center focus:outline-none focus:border-primary-400 bg-gray-50 placeholder-gray-300"
                          placeholder="—"
                          value={local.reps}
                          onChange={(e) => setField(ex.id, 'reps', e.target.value)}
                          onBlur={() => handleBlur(ex.id, 'reps')}
                        />
                        <button
                          onClick={() => handleRemoveSet(ex.id)}
                          disabled={local.sets <= 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed rounded"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Set */}
                  <button
                    onClick={() => handleAddSet(ex.id)}
                    className="mt-1 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Set
                  </button>
                </div>
              </div>
            </div>
          );
        })
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
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPicker(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Select Exercise</h2>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="px-4 pt-3 pb-2 space-y-2">
              <input
                type="text"
                className="input w-full"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <select className="input text-sm" value={filterEquipment} onChange={(e) => setFilterEquipment(e.target.value)}>
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <option key={eq} value={eq === 'All Equipment' ? '' : eq}>{eq}</option>
                  ))}
                </select>
                <select className="input text-sm" value={filterMuscle} onChange={(e) => setFilterMuscle(e.target.value)}>
                  {MUSCLE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filtered.map((ex) => (
                <button
                  key={ex.name}
                  disabled={isSubmitting}
                  onClick={() => handlePickExercise(ex)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <ExerciseImage images={ex.images} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-400">{MUSCLE_LABEL[ex.muscleGroup]}</p>
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
