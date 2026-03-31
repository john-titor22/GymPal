import { ExerciseImage } from './ExerciseImage';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', LEGS: 'Legs', GLUTES: 'Glutes', CORE: 'Core',
  FULL_BODY: 'Full Body', OTHER: 'Other',
};

export function ExerciseDetailModal({ exercise, images, onClose, onAdd, isAdding }) {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/25 hover:bg-black/40 rounded-full text-white transition"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Animated image — full width, square */}
        <div className="w-full" style={{ height: 280 }}>
          <ExerciseImage images={images} size="full" animate className="rounded-none" />
        </div>

        {/* Info */}
        <div className="px-5 pt-4 pb-5">
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{exercise.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.muscleGroup && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                {MUSCLE_LABEL[exercise.muscleGroup] ?? exercise.muscleGroup}
              </span>
            )}
            {exercise.equipment && (
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                {exercise.equipment}
              </span>
            )}
          </div>

          {onAdd && (
            <button
              onClick={onAdd}
              disabled={isAdding}
              className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm transition"
            >
              {isAdding ? 'Adding…' : 'Add to Routine'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
