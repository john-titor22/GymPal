import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgramStore } from '../../store/programStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function ProgramsPage() {
  const navigate = useNavigate();
  const { programs, isLoading, fetchPrograms, createProgram, deleteProgram, activateProgram } = useProgramStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', durationWeeks: 4 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  async function handleCreate(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const program = await createProgram({ ...form, durationWeeks: Number(form.durationWeeks) });
      setShowModal(false);
      setForm({ name: '', description: '', durationWeeks: 4 });
      navigate(`/programs/${program.id}`);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <Button onClick={() => setShowModal(true)}>+ New Program</Button>
      </div>

      {/* New program row — like Hevy's "New Routine" */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 11v6m-3-3h6" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">New Program</span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-16 gap-3 text-center">
          <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="font-semibold text-gray-900">Get started</p>
          <p className="text-sm text-gray-500">Start by creating a program!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {programs.map((program) => (
            <div key={program.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/programs/${program.id}`)}>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{program.name}</p>
                  {program.isActive && <Badge color="blue">Active</Badge>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {program.durationWeeks} weeks · {program.workoutDays.length} days
                  {program.description ? ` · ${program.description}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {!program.isActive && (
                  <button onClick={() => activateProgram(program.id)}
                    className="text-xs text-primary-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-50 transition">
                    Activate
                  </button>
                )}
                <button onClick={() => deleteProgram(program.id)}
                  className="text-xs text-red-400 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  Delete
                </button>
                <svg className="w-5 h-5 text-gray-300 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  strokeWidth={2} onClick={() => navigate(`/programs/${program.id}`)}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Program">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Program name" placeholder="e.g. Push Pull Legs" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea className="input resize-none" rows={3} placeholder="What's this program about?"
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <Input label="Duration (weeks)" type="number" min={1} max={52} value={form.durationWeeks}
            onChange={(e) => setForm((f) => ({ ...f, durationWeeks: e.target.value }))} />
          <div className="flex justify-end gap-3 mt-1">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
