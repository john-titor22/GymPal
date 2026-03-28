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
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Avatar row */}
        <div className="flex items-center gap-4 px-5 py-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
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
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" isLoading={isSaving}>Save changes</Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
