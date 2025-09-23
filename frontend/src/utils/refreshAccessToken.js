import api from './api';

export const refreshAccessToken = async () => {
  // 1️⃣ Check if access token exists first
  const existingAccessToken = localStorage.getItem('accessToken');
  if (existingAccessToken) {
    return existingAccessToken; // ✅ trust it unless your backend enforces refresh
  }

  // 2️⃣ No access token? Try refresh
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await api.post('/refresh', { token: refreshToken });
    localStorage.setItem('accessToken', res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data.accessToken;
  } catch (err) {
    console.error('Refresh failed:', err);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};
