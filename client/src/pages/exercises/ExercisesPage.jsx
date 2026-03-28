import { useState, useMemo } from 'react';
import { EXERCISE_LIBRARY, MUSCLE_OPTIONS, EQUIPMENT_OPTIONS } from '../../data/exerciseLibrary';
import { BodyDiagram } from '../../components/ui/BodyDiagram';
import { ExerciseImage } from '../../components/ui/ExerciseImage';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', LEGS: 'Legs', GLUTES: 'Glutes', CORE: 'Core',
  FULL_BODY: 'Full Body', OTHER: 'Other',
};

const MUSCLE_COLOR = {
  CHEST: 'bg-red-50 text-red-600',
  BACK: 'bg-blue-50 text-blue-600',
  SHOULDERS: 'bg-orange-50 text-orange-600',
  BICEPS: 'bg-purple-50 text-purple-600',
  TRICEPS: 'bg-pink-50 text-pink-600',
  LEGS: 'bg-green-50 text-green-600',
  GLUTES: 'bg-yellow-50 text-yellow-600',
  CORE: 'bg-indigo-50 text-indigo-600',
  FULL_BODY: 'bg-primary-50 text-primary-600',
  OTHER: 'bg-gray-100 text-gray-500',
};

export function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
      const matchEquip = !filterEquipment || ex.equipment === filterEquipment;
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [search, filterMuscle, filterEquipment]);

  if (selected) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Exercises
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Big animated image */}
          <ExerciseImage images={selected.images} size="xl" className="w-full !rounded-xl mb-4" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selected.name}</h1>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700">Equipment:</span> {selected.equipment || 'Bodyweight'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">Primary Muscle:</span> {MUSCLE_LABEL[selected.muscleGroup]}
              </p>
            </div>
            <BodyDiagram muscleGroup={selected.muscleGroup} size="md" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">Statistics</p>
          <p className="text-sm text-gray-400">Start logging this exercise to see your progress over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>

      {/* Search & filters */}
      <div className="space-y-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input w-full pl-9"
            placeholder="Search Exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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

      {/* Popular label */}
      {!search && !filterMuscle && !filterEquipment && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Popular Exercises</p>
      )}

      {/* Exercise list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {filtered.map((ex) => (
          <button
            key={ex.name}
            onClick={() => setSelected(ex)}
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
          <p className="text-center text-gray-400 text-sm py-10">No exercises found</p>
        )}
      </div>
    </div>
  );
}
