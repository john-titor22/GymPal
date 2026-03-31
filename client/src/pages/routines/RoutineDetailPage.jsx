import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutineStore } from '../../store/routineStore';
import { BodyDiagram } from '../../components/ui/BodyDiagram';
import { ExerciseImage } from '../../components/ui/ExerciseImage';
import { EXERCISE_LIBRARY, MUSCLE_OPTIONS, EQUIPMENT_OPTIONS } from '../../data/exerciseLibrary';
import { resizeImage } from '../../utils/imageResize';
import { routinesApi } from '../../api/routines.api';

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
  { value: 'normal',  label: 'Normal',  badge: null, bg: 'bg-gray-100',  text: 'text-gray-600'  },
  { value: 'failure', label: 'Failure', badge: 'F', bg: 'bg-red-100',    text: 'text-red-500'   },
  { value: 'drop',    label: 'Drop',    badge: 'D', bg: 'bg-blue-100',   text: 'text-blue-500'  },
];

function getTypeMeta(type) {
  return SET_TYPES.find((t) => t.value === type) || SET_TYPES[1];
}

/** Build a setsData array from an exercise (handles legacy and new format) */
function buildSetsData(ex) {
  const raw = Array.isArray(ex.setsData) ? ex.setsData : [];
  return Array.from({ length: Math.max(ex.sets, 1) }, (_, i) => ({
    reps: raw[i]?.reps != null ? String(raw[i].reps) : '',
    weight: raw[i]?.weight != null ? String(raw[i].weight) : '',
    type: raw[i]?.type || 'normal',
  }));
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
  const [pickerSelected, setPickerSelected] = useState(null); // name of previewed exercise
  const [animatingExercise, setAnimatingExercise] = useState(null); // id of animating routine exercise
  // { [exerciseId]: { setsData: [{reps, weight, type}], notes, restTimer } }
  const [localData, setLocalData] = useState({});
  const [openTypeMenu, setOpenTypeMenu] = useState(null); // `${exerciseId}-${setIndex}`
  const typeMenuRef = useRef(null);
  const [routineImage, setRoutineImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => { fetchRoutineById(id); }, [id, fetchRoutineById]);

  useEffect(() => {
    if (currentRoutine?.image) setRoutineImage(currentRoutine.image);
  }, [currentRoutine?.id]);

  useEffect(() => {
    if (!currentRoutine) return;
    setLocalData((prev) => {
      const next = { ...prev };
      currentRoutine.exercises.forEach((ex) => {
        if (!next[ex.id]) {
          next[ex.id] = {
            setsData: buildSetsData(ex),
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

  async function handleRoutineImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const base64 = await resizeImage(file, 800, 0.8);
      await routinesApi.update(id, { image: base64 });
      setRoutineImage(base64);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  }

  const filtered = useMemo(() => EXERCISE_LIBRARY.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
    const matchEquip = !filterEquipment || filterEquipment === 'All Equipment' || ex.equipment === filterEquipment;
    return matchSearch && matchMuscle && matchEquip;
  }), [search, filterMuscle, filterEquipment]);

  // Update a single set's field in local state
  function updateSetField(exerciseId, setIndex, field, value) {
    setLocalData((prev) => {
      const setsData = prev[exerciseId]?.setsData?.map((s, i) =>
        i === setIndex ? { ...s, [field]: value } : s
      ) || [];
      return { ...prev, [exerciseId]: { ...prev[exerciseId], setsData } };
    });
  }

  // Save full setsData to server
  async function saveSetsData(exerciseId, setsData) {
    await updateExercise(id, exerciseId, {
      setsData: setsData.map((s) => ({
        reps: s.reps === '' ? null : Number(s.reps),
        weight: s.weight === '' ? null : Number(s.weight),
        type: s.type,
      })),
    });
  }

  async function handleSetBlur(exerciseId) {
    const setsData = localData[exerciseId]?.setsData || [];
    await saveSetsData(exerciseId, setsData);
  }

  async function handleRestTimer(exerciseId, value) {
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], restTimer: value } }));
    await updateExercise(id, exerciseId, { restTimer: value === '' ? null : Number(value) });
  }

  async function handleNotesBlur(exerciseId) {
    const notes = localData[exerciseId]?.notes || '';
    await updateExercise(id, exerciseId, { notes: notes || null });
  }

  async function handleAddSet(exerciseId) {
    const setsData = [...(localData[exerciseId]?.setsData || []), { reps: '', weight: '', type: 'normal' }];
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], setsData } }));
    await saveSetsData(exerciseId, setsData);
  }

  async function handleRemoveSet(exerciseId) {
    const current = localData[exerciseId]?.setsData || [];
    if (current.length <= 1) return;
    const setsData = current.slice(0, -1);
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], setsData } }));
    await saveSetsData(exerciseId, setsData);
  }

  async function handleSetType(exerciseId, setIndex, typeValue) {
    const setsData = (localData[exerciseId]?.setsData || []).map((s, i) =>
      i === setIndex ? { ...s, type: typeValue } : s
    );
    setLocalData((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], setsData } }));
    setOpenTypeMenu(null);
    await saveSetsData(exerciseId, setsData);
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

  const totalSets = currentRoutine.exercises.reduce((t, e) => t + (localData[e.id]?.setsData?.length ?? e.sets), 0);
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

      {/* Routine image banner */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer group"
        style={{ height: routineImage ? 180 : 64 }}
        onClick={() => imageInputRef.current?.click()}
      >
        {routineImage ? (
          <img src={routineImage} alt="routine" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Add cover photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          {imageUploading ? (
            <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="flex items-center gap-2 bg-black/50 rounded-xl px-3 py-1.5">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-white font-semibold">{routineImage ? 'Change photo' : 'Add photo'}</span>
            </div>
          )}
        </div>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleRoutineImageChange} />
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
          const local = localData[ex.id] || { setsData: buildSetsData(ex), notes: '', restTimer: '' };
          const { setsData, notes, restTimer } = local;
          return (
            <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {/* Exercise header */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 rounded-t-2xl cursor-pointer"
                onClick={() => setAnimatingExercise((p) => p === ex.id ? null : ex.id)}
              >
                <ExerciseImage images={IMG_MAP[ex.name]} size="md" animate={animatingExercise === ex.id} />
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
                    value={notes}
                    onChange={(e) => setLocalData((prev) => ({ ...prev, [ex.id]: { ...prev[ex.id], notes: e.target.value } }))}
                    onBlur={() => handleNotesBlur(ex.id)}
                  />
                </div>

                {/* Rest Timer */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rest Timer</p>
                  <select
                    className="w-40 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 bg-gray-50"
                    value={restTimer}
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

                  {setsData.map((set, i) => {
                    const meta = getTypeMeta(set.type);
                    const menuKey = `${ex.id}-${i}`;
                    return (
                      <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr_2rem] gap-2 items-center mb-2">
                        {/* Set badge — tap to change type */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenTypeMenu(openTypeMenu === menuKey ? null : menuKey)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition ${meta.bg} ${meta.text}`}
                          >
                            {meta.badge ?? (i + 1)}
                          </button>

                          {openTypeMenu === menuKey && (
                            <div
                              ref={typeMenuRef}
                              className="absolute left-0 bottom-full mb-1 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 w-40"
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
                                  {set.type === t.value && (
                                    <svg className="w-4 h-4 text-primary-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* KG — independent per set */}
                        <input
                          type="number"
                          min="0"
                          className="h-9 w-full border border-gray-200 rounded-xl px-2 text-sm text-center focus:outline-none focus:border-primary-400 bg-gray-50 placeholder-gray-300"
                          placeholder="—"
                          value={set.weight}
                          onChange={(e) => updateSetField(ex.id, i, 'weight', e.target.value)}
                          onBlur={() => handleSetBlur(ex.id)}
                        />

                        {/* Reps — independent per set */}
                        <input
                          type="number"
                          min="0"
                          className="h-9 w-full border border-gray-200 rounded-xl px-2 text-sm text-center focus:outline-none focus:border-primary-400 bg-gray-50 placeholder-gray-300"
                          placeholder="—"
                          value={set.reps}
                          onChange={(e) => updateSetField(ex.id, i, 'reps', e.target.value)}
                          onBlur={() => handleSetBlur(ex.id)}
                        />

                        <button
                          onClick={() => handleRemoveSet(ex.id)}
                          disabled={setsData.length <= 1}
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
              {filtered.map((ex) => {
                const selected = pickerSelected === ex.name;
                return (
                  <div
                    key={ex.name}
                    className={`flex items-center gap-3 px-4 py-3 transition cursor-pointer ${selected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setPickerSelected(selected ? null : ex.name)}
                  >
                    <ExerciseImage images={ex.images} size="md" animate={selected} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ex.name}</p>
                      <p className="text-xs text-gray-400">{MUSCLE_LABEL[ex.muscleGroup]}</p>
                    </div>
                    {selected && (
                      <button
                        disabled={isSubmitting}
                        onClick={(e) => { e.stopPropagation(); handlePickExercise(ex); setPickerSelected(null); }}
                        className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
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
