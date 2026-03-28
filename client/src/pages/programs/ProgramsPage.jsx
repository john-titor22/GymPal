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

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

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
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Programs</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your workout programs</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Program</Button>
      </div>

      {programs.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-4 text-center">
          <div className="text-4xl">📋</div>
          <div>
            <p className="font-medium text-slate-200">No programs yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first workout program</p>
          </div>
          <Button onClick={() => setShowModal(true)}>Create Program</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <div key={program.id} className="card hover:border-primary-600/50 transition cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1" onClick={() => navigate(`/programs/${program.id}`)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100 group-hover:text-primary-400 transition">
                      {program.name}
                    </h3>
                    {program.isActive && <Badge color="green">Active</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {program.durationWeeks} weeks · {program.workoutDays.length} days
                  </p>
                  {program.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{program.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-700">
                {!program.isActive && (
                  <Button
                    variant="outline"
                    className="text-xs py-1 px-2"
                    onClick={() => activateProgram(program.id)}
                  >
                    Set Active
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-xs py-1 px-2"
                  onClick={() => navigate(`/programs/${program.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="text-xs py-1 px-2 ml-auto"
                  onClick={() => deleteProgram(program.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Program">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Program name"
            placeholder="e.g. Push Pull Legs"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400 font-medium">Description (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What's this program about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Input
            label="Duration (weeks)"
            type="number"
            min={1}
            max={52}
            value={form.durationWeeks}
            onChange={(e) => setForm((f) => ({ ...f, durationWeeks: e.target.value }))}
          />
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
