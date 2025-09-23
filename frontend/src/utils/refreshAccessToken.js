import api from "./api";

export const refreshAccessToken = async () => {
  try {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // ✅ Step 1: If access token exists, check expiry before trusting it
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (!isExpired) {
        return accessToken; // Still valid ✅
      }
    }

    // ❌ Access token missing or expired: attempt refresh
    if (!refreshToken) return null;

    const res = await api.post("/refresh", { token: refreshToken });
    accessToken = res.data.accessToken;

    // If refresh worked, persist new tokens
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      return accessToken;
    }

    // ❌ If refresh API didn't return token, force logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  } catch (err) {
    console.error("Refresh failed:", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};
