import axios from "axios";

const PROFILE_KEY = "homereel.profile";

// The login lives in an httpOnly cookie. Flask also sets a readable csrf_access_token cookie,
// which axios copies into the X-CSRF-TOKEN header on every request.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrf_access_token",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

export const getStoredProfile = () => {
  try {
    return JSON.parse(sessionStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
};
export const storeProfile = (profile) => {
  try {
    if (profile) sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    else sessionStorage.removeItem(PROFILE_KEY);
  } catch {
    /* private mode: the profile is just forgotten on reload */
  }
};

api.interceptors.request.use((config) => {
  const profile = getStoredProfile();
  if (profile) config.headers["X-Profile-Id"] = profile.id;
  return config;
});

// AuthContext registers this so an expired login sends the user back to the sign-in page.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.startsWith("/auth/") && !url.startsWith("/invites/")) onUnauthorized();
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = "Something went wrong") =>
  error.response?.data?.error || (error.response ? fallback : "Couldn't reach the server");

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data.user);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me").then((r) => r.data.user);
export const getProfiles = () => api.get("/profiles").then((r) => r.data.results);
export const addProfile = (name, isKid) => api.post("/profiles", { name, is_kid: isKid }).then((r) => r.data);

export const getRows = () => api.get("/movies/rows").then((r) => r.data);
export const getFreeElsewhere = () => api.get("/movies/free").then((r) => r.data.results);
export const getMovie = (id) => api.get(`/movies/${id}`).then((r) => r.data);
export const getSimilar = (id) => api.get(`/movies/${id}/similar`).then((r) => r.data.results);
export const getTmdbMovie = (tmdbId) => api.get(`/tmdb/${tmdbId}`).then((r) => r.data);
export const searchMovies = (q, signal) =>
  api.get("/movies/search", { params: { q }, signal }).then((r) => r.data);

export const getProgress = (id) => api.get(`/progress/${id}`).then((r) => r.data);
export const saveProgress = (id, position, duration) =>
  api.put(`/progress/${id}`, { position_sec: position, duration_sec: duration });

// For the last save when the tab closes: keepalive lets the request outlive the page.
export const saveProgressOnExit = (id, position, duration) => {
  const csrf = document.cookie.match(/(?:^|; )csrf_access_token=([^;]*)/)?.[1];
  const profile = getStoredProfile();
  if (!csrf || !profile) return;
  fetch(`/api/progress/${id}`, {
    method: "PUT",
    keepalive: true,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": decodeURIComponent(csrf),
      "X-Profile-Id": profile.id,
    },
    body: JSON.stringify({ position_sec: position, duration_sec: duration }),
  }).catch(() => {});
};

export const scanLibrary = () => api.post("/admin/scan").then((r) => r.data);
export const getUnmatched = () => api.get("/admin/unmatched").then((r) => r.data.results);
export const fixMatch = (id, tmdbId) =>
  api.post(`/admin/movies/${id}/match`, { tmdb_id: tmdbId }).then((r) => r.data);
export const addFromArchive = (link) => api.post("/admin/archive", { link }).then((r) => r.data);
export const refreshRatings = () => api.post("/admin/ratings/refresh").then((r) => r.data);

export const getAccounts = () => api.get("/admin/users").then((r) => r.data.results);
export const addAccount = (email, password, admin) =>
  api.post("/admin/users", { email, password, admin }).then((r) => r.data);
export const removeAccount = (id) => api.delete(`/admin/users/${id}`);
export const createInvite = (email) => api.post("/admin/invites", { email }).then((r) => r.data);
export const checkInvite = (token) => api.get(`/invites/${token}`).then((r) => r.data);
export const acceptInvite = (token, email, password) =>
  api.post(`/invites/${token}`, { email, password }).then((r) => r.data.user);

export const streamUrl = (id) => `/api/stream/${id}`;

export default api;
