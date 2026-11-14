// Color and image tokens. CSS reads the same values as custom properties (see index.css).
export const theme = {
  bg: "#0e0d0c",
  text: "#f3efe9",
  muted: "#a8a29a",
  gold: "#e9b949",
};

const TMDB_IMG = "https://image.tmdb.org/t/p";

export const posterUrl = (path, size = "w342") => (path ? `${TMDB_IMG}/${size}${path}` : null);
export const backdropUrl = (path, size = "w1280") => (path ? `${TMDB_IMG}/${size}${path}` : null);
export const logoUrl = (path) => (path ? `${TMDB_IMG}/w92${path}` : null);

export const formatRuntime = (min) => (min ? `${Math.floor(min / 60)}H ${min % 60} MIN` : null);
