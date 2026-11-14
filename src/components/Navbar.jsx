import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { CloseIcon, MenuIcon, SearchIcon } from "./Icons.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, profile, setProfile, logout } = useAuth();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [searchOpen, setSearchOpen] = useState(pathname === "/search");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Leaving the search page closes and clears the search box; any navigation closes the menu.
  useEffect(() => {
    setMenuOpen(false);
    if (pathname !== "/search") {
      setQuery("");
      setSearchOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);

  const onChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/", { replace: pathname === "/search" });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    if (pathname === "/search") navigate("/");
  };

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar--solid" : ""}`}>
        <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Link to="/" className="wordmark">HomeReel</Link>
        <div className={`search ${searchOpen ? "search--open" : ""}`}>
          {searchOpen && (
            <input
              ref={input}
              type="search"
              placeholder="Search movies"
              aria-label="Search movies"
              value={query}
              onChange={onChange}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
            />
          )}
          <button
            className="icon-btn"
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            aria-label={searchOpen ? "Close search" : "Search"}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
        </div>
      </header>
      <nav className={`drawer ${menuOpen ? "drawer--open" : ""}`} aria-hidden={!menuOpen}>
        {profile && (
          <div className="drawer__profile">
            <span className="profile__avatar profile__avatar--small" style={{ "--avatar": profile.avatar }}>
              {profile.name[0].toUpperCase()}
            </span>
            <span>{profile.name}</span>
          </div>
        )}
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        {user?.role === "admin" && <NavLink to="/admin">Library</NavLink>}
        <div className="drawer__bottom">
          <button onClick={() => { setProfile(null); navigate("/profiles"); }}>Switch profile</button>
          <button onClick={logout}>Sign out</button>
        </div>
      </nav>
      {menuOpen && <div className="drawer-scrim" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
