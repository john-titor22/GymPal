import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useInitAuth } from './hooks/useAuth';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RoutinesPage } from './pages/routines/RoutinesPage';
import { RoutineDetailPage } from './pages/routines/RoutineDetailPage';
import { ExercisesPage } from './pages/exercises/ExercisesPage';
import { WorkoutSessionPage } from './pages/session/WorkoutSessionPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';
import { SchedulePage } from './pages/schedule/SchedulePage';

function PrivateRoute({ children }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  useInitAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/:id" element={<RoutineDetailPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/session" element={<WorkoutSessionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
