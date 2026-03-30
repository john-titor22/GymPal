import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';

const baseNav = [
  { to: '/dashboard',  label: 'Home',      icon: HomeIcon },
  { to: '/routines',   label: 'Routines',  icon: RoutinesIcon },
  { to: '/exercises',  label: 'Exercises', icon: ExercisesIcon },
  { to: '/schedule',   label: 'Schedule',  icon: ScheduleIcon },
  { to: '/profile',    label: 'Profile',   icon: UserIcon },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const nav = user?.isAdmin
    ? [...baseNav, { to: '/admin', label: 'Admin', icon: AdminIcon }]
    : baseNav;
  const navigate = useNavigate();

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/');
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-sm">G</div>
        <span className="text-base font-bold text-gray-900">GymPal</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => <><Icon active={isActive} />{label}</>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-500 transition"
        >
          <LogoutIcon />
          Log out
        </button>
      </div>
    </aside>
  );
}

function HomeIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function RoutinesIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
}
function ExercisesIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
function UserIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function ScheduleIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function AdminIcon({ active }) {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function LogoutIcon() {
  return <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}
