import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/profile'); return; }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(userId, userName) {
    if (!window.confirm(`Delete user "${userName}"? This is irreversible.`)) return;
    setActionId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleAdmin(userId) {
    setActionId(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-admin`);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isAdmin: data.isAdmin } : u));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Profile
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-0.5">{users.length} registered users</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {users.map((u) => (
            <div key={u.id} className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  {u.isAdmin && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">ADMIN</span>
                  )}
                  {u.id === user?.id && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">YOU</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                <p className="text-xs text-gray-400">
                  {u._count?.sessions ?? 0} workouts · {u._count?.routines ?? 0} routines ·{' '}
                  Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {u.id !== user?.id && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleAdmin(u.id)}
                    disabled={actionId === u.id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                      u.isAdmin
                        ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                        : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {u.isAdmin ? 'Revoke' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    disabled={actionId === u.id}
                    className="text-xs font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
