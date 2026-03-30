import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/dashboard',  label: 'Home',      icon: HomeIcon },
  { to: '/routines',   label: 'Routines',  icon: RoutinesIcon },
  { to: '/schedule',   label: 'Schedule',  icon: ScheduleIcon },
  { to: '/profile',    label: 'Profile',   icon: UserIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex safe-bottom md:hidden">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-primary-600' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => <><Icon active={isActive} />{label}</>}
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function RoutinesIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
}
function ExercisesIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}
function ScheduleIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function UserIcon({ active }) {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
