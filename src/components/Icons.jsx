const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const MenuIcon = () => <svg {...base}><path d="M4 7h16M4 12h10M4 17h16" /></svg>;
export const SearchIcon = () => <svg {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>;
export const CloseIcon = () => <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const PlayIcon = () => <svg {...base} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z" /></svg>;
export const FilmIcon = () => <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></svg>;
export const ChevronLeft = () => <svg {...base}><path d="m15 6-6 6 6 6" /></svg>;
export const ChevronRight = () => <svg {...base}><path d="m9 6 6 6-6 6" /></svg>;
export const BackIcon = () => <svg {...base}><path d="M19 12H5m6-6-6 6 6 6" /></svg>;
