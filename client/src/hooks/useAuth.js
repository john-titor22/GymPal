import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export function useInitAuth() {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    async function init() {
      try {
        const { data: tokenData } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
        const { data: user } = await axios.get(`${BASE}/users/me`, {
          headers: { Authorization: `Bearer ${tokenData.accessToken}` },
          withCredentials: true,
        });
        setAuth(user, tokenData.accessToken);
      } catch (err) {
        // Only force logout when the server explicitly rejects the token (401).
        // Network errors / timeouts should not log the user out — the axios
        // interceptor in api/axios.js will retry the refresh on the next API call.
        if (err.response?.status === 401) {
          logout();
        } else {
          setLoading(false);
        }
      }
    }
    init();
  }, []);
}
