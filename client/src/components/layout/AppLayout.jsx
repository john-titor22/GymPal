import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div
      className="flex min-h-screen bg-gray-50"
      /* Push content below the iOS status bar / Dynamic Island in standalone mode */
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <Sidebar />

      {/* Scrollable page content */}
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{
          /* Clear fixed bottom nav + home indicator */
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-5 md:py-8 md:pb-0">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
