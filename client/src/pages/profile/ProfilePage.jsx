import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const GOALS = [
  { value: 'MAINTAIN', label: 'Maintain' },
  { value: 'CUT', label: 'Cut' },
  { value: 'BULK', label: 'Bulk' },
];

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    weight: user?.weight || '',
    fitnessGoal: user?.fitnessGoal || 'MAINTAIN',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await authApi.updateProfile({
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
      });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-surface-700">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Body weight (kg)"
            type="number"
            min={0}
            placeholder="Optional"
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
          />
          <Select
            label="Fitness goal"
            options={GOALS}
            value={form.fitnessGoal}
            onChange={(e) => setForm((f) => ({ ...f, fitnessGoal: e.target.value }))}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={isSaving}>Save changes</Button>
            {saved && <span className="text-sm text-primary-500">Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
