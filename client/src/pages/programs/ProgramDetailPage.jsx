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
  const [exerciseModal, setExerciseModal] = useState(null); // dayId
  const [dayForm, setDayForm] = useState({ name: '' });
  const [exForm, setExForm] = useState({ name: '', muscleGroup: 'OTHER', sets: 3, reps: 10, weight: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProgramById(id);
  }, [id, fetchProgramById]);

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
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/programs')} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-2">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">{currentProgram.name}</h1>
            {currentProgram.isActive && <Badge color="green">Active</Badge>}
          </div>
          <p className="text-slate-400 text-sm mt-1">{currentProgram.durationWeeks} weeks program</p>
          {currentProgram.description && <p className="text-sm text-slate-500 mt-1">{currentProgram.description}</p>}
        </div>
        <div className="flex gap-2">
          {!currentProgram.isActive && (
            <Button variant="outline" onClick={() => activateProgram(id)}>Set Active</Button>
          )}
          <Button onClick={() => setDayModal(true)}>+ Add Day</Button>
        </div>
      </div>

      {/* Workout days */}
      {currentProgram.workoutDays.length === 0 ? (
        <div className="card flex flex-col items-center py-12 gap-3 text-center">
          <div className="text-3xl">📅</div>
          <p className="text-slate-400 text-sm">No workout days yet. Add a day to get started.</p>
          <Button onClick={() => setDayModal(true)}>Add Day</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentProgram.workoutDays.map((day) => (
            <div key={day.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-100">{day.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-xs py-1 px-2" onClick={() => setExerciseModal(day.id)}>
                    + Exercise
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs py-1 px-2 text-red-400 hover:text-red-300"
                    onClick={() => removeWorkoutDay(id, day.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {!day.exercises || day.exercises.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No exercises yet</p>
              ) : (
                <div className="space-y-2">
                  {day.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between bg-surface-900 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{ex.name}</p>
                          <p className="text-xs text-slate-500">
                            {ex.sets} sets × {ex.reps} reps
                            {ex.weight ? ` · ${ex.weight}kg` : ''}
                            {' · '}{ex.muscleGroup.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExercise(day.id, ex.id)}
                        className="text-slate-600 hover:text-red-400 transition text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {day.exercises?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-700">
                  <Button
                    variant="primary"
                    className="w-full justify-center text-sm"
                    onClick={() => navigate('/session', { state: { workoutDayId: day.id, dayName: day.name } })}
                  >
                    Start Workout
                  </Button>
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
            <Input
              label="Sets"
              type="number"
              min={1}
              value={exForm.sets}
              onChange={(e) => setExForm((f) => ({ ...f, sets: e.target.value }))}
            />
            <Input
              label="Reps"
              type="number"
              min={1}
              value={exForm.reps}
              onChange={(e) => setExForm((f) => ({ ...f, reps: e.target.value }))}
            />
            <Input
              label="Weight (kg)"
              type="number"
              min={0}
              placeholder="opt."
              value={exForm.weight}
              onChange={(e) => setExForm((f) => ({ ...f, weight: e.target.value }))}
            />
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
