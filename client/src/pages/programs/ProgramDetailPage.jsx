import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgramStore } from '../../store/programStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

const MUSCLE_GROUPS = [
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'BICEPS', label: 'Biceps' },
  { value: 'TRICEPS', label: 'Triceps' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'GLUTES', label: 'Glutes' },
  { value: 'CORE', label: 'Core' },
  { value: 'FULL_BODY', label: 'Full Body' },
  { value: 'OTHER', label: 'Other' },
];

export function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProgram, isLoading, fetchProgramById, addWorkoutDay, removeWorkoutDay, addExercise, removeExercise, activateProgram } = useProgramStore();

  const [dayModal, setDayModal] = useState(false);
  const [exerciseModal, setExerciseModal] = useState(null);
  const [dayForm, setDayForm] = useState({ name: '' });
  const [exForm, setExForm] = useState({ name: '', muscleGroup: 'OTHER', sets: 3, reps: 10, weight: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchProgramById(id); }, [id, fetchProgramById]);

  async function handleAddDay(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dayOrder = currentProgram.workoutDays.length;
      await addWorkoutDay(id, { ...dayForm, dayOrder });
      setDayModal(false);
      setDayForm({ name: '' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddExercise(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addExercise(exerciseModal, {
        ...exForm,
        sets: Number(exForm.sets),
        reps: Number(exForm.reps),
        weight: exForm.weight ? Number(exForm.weight) : undefined,
      });
      setExerciseModal(null);
      setExForm({ name: '', muscleGroup: 'OTHER', sets: 3, reps: 10, weight: '', notes: '' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !currentProgram) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/programs')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Programs
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{currentProgram.name}</h1>
              {currentProgram.isActive && <Badge color="blue">Active</Badge>}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {currentProgram.durationWeeks} weeks · {currentProgram.workoutDays.length} days
            </p>
            {currentProgram.description && (
              <p className="text-sm text-gray-500 mt-1">{currentProgram.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {!currentProgram.isActive && (
              <Button variant="outline" onClick={() => activateProgram(id)}>Activate</Button>
            )}
            <Button onClick={() => setDayModal(true)}>+ Add Day</Button>
          </div>
        </div>
      </div>

      {/* Workout days */}
      {currentProgram.workoutDays.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-14 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">📅</div>
          <p className="font-semibold text-gray-900">No workout days yet</p>
          <p className="text-sm text-gray-500">Add a day to start building your program</p>
          <Button onClick={() => setDayModal(true)} className="mt-1">Add Day</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentProgram.workoutDays.map((day) => (
            <div key={day.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {/* Day header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{day.name}</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExerciseModal(day.id)}
                    className="text-xs text-primary-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-50 transition"
                  >
                    + Exercise
                  </button>
                  <button
                    onClick={() => removeWorkoutDay(id, day.id)}
                    className="text-xs text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Exercises */}
              {!day.exercises || day.exercises.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">No exercises yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {day.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight ? ` · ${ex.weight}kg` : ''}
                          {' · '}{ex.muscleGroup.replace('_', ' ')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(day.id, ex.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Start workout */}
              {day.exercises?.length > 0 && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => navigate('/session', { state: { workoutDayId: day.id, dayName: day.name } })}
                    className="w-full py-2.5 rounded-xl bg-primary-50 text-primary-600 font-semibold text-sm hover:bg-primary-100 transition"
                  >
                    Start Workout
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Day Modal */}
      <Modal isOpen={dayModal} onClose={() => setDayModal(false)} title="Add Workout Day">
        <form onSubmit={handleAddDay} className="flex flex-col gap-4">
          <Input
            label="Day name"
            placeholder="e.g. Push Day, Legs, Day 1"
            value={dayForm.name}
            onChange={(e) => setDayForm({ name: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setDayModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Add</Button>
          </div>
        </form>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal isOpen={!!exerciseModal} onClose={() => setExerciseModal(null)} title="Add Exercise">
        <form onSubmit={handleAddExercise} className="flex flex-col gap-4">
          <Input
            label="Exercise name"
            placeholder="e.g. Bench Press"
            value={exForm.name}
            onChange={(e) => setExForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="Muscle group"
            options={MUSCLE_GROUPS}
            value={exForm.muscleGroup}
            onChange={(e) => setExForm((f) => ({ ...f, muscleGroup: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Sets" type="number" min={1} value={exForm.sets}
              onChange={(e) => setExForm((f) => ({ ...f, sets: e.target.value }))} />
            <Input label="Reps" type="number" min={1} value={exForm.reps}
              onChange={(e) => setExForm((f) => ({ ...f, reps: e.target.value }))} />
            <Input label="Weight (kg)" type="number" min={0} placeholder="opt." value={exForm.weight}
              onChange={(e) => setExForm((f) => ({ ...f, weight: e.target.value }))} />
          </div>
          <Input
            label="Notes (optional)"
            placeholder="e.g. Pause at bottom"
            value={exForm.notes}
            onChange={(e) => setExForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setExerciseModal(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
