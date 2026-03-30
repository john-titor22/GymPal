import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutineStore } from '../../store/routineStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export function RoutinesPage() {
  const navigate = useNavigate();
  const { routines, isLoading, fetchRoutines, createRoutine, deleteRoutine } = useRoutineStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const routine = await createRoutine({ name: name.trim() });
      setShowModal(false);
      setName('');
      navigate(`/routines/${routine.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Routines</h1>

      {/* New Routine row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">New Routine</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Routine list */}
      {routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-16 gap-3 text-center">
          <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="font-semibold text-gray-900">Get started</p>
          <p className="text-sm text-gray-500">Start by creating a routine!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {routines.map((routine) => (
            <div key={routine.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/routines/${routine.id}`)}>
                {routine.image ? (
                  <img src={routine.image} alt={routine.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{routine.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {routine.exercises.length} exercises · {routine.exercises.reduce((t, e) => t + e.sets, 0)} sets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => deleteRoutine(routine.id)}
                  className="text-xs text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
                <svg
                  className="w-5 h-5 text-gray-300 cursor-pointer"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  onClick={() => navigate(`/routines/${routine.id}`)}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Routine">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Routine name"
            placeholder="e.g. Push Day, Full Body, Day A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 mt-1">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
