import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/dashboard', label: 'Home',      Icon: HomeIcon },
  { to: '/routines',  label: 'Routines',  Icon: RoutinesIcon },
  { to: '/exercises', label: 'Exercises', Icon: ExercisesIcon },
  { to: '/schedule',  label: 'Schedule',  Icon: ScheduleIcon },
  { to: '/profile',   label: 'Profile',   Icon: UserIcon },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Frosted glass bar */}
      <div className="flex bg-white/85 backdrop-blur-2xl border-t border-gray-200/60 px-1">
        {nav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[54px]
                       transition-transform duration-100 active:scale-90"
          >
            {({ isActive }) => (
              <>
                {/* Pill highlight on active icon */}
                <div
                  className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200
                    ${isActive ? 'bg-primary-100' : ''}`}
                >
                  <Icon active={isActive} />
                </div>

                <span
                  className={`text-[10px] font-semibold tracking-tight leading-none transition-colors
                    ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/* ── Icons — filled when active, outline when inactive ── */

function HomeIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function RoutinesIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ExercisesIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ScheduleIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
