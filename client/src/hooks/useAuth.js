import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export function useInitAuth() {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    async function init() {
      try {
        const { data: tokenData } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        const { data: user } = await axios.get(`${BASE}/users/me`, {
          headers: { Authorization: `Bearer ${tokenData.accessToken}` },
          withCredentials: true,
        });
        setAuth(user, tokenData.accessToken);
      } catch {
        logout();
      }
    }
    init();
  }, []);
}
