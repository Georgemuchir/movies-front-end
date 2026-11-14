import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addProfile, errorMessage, getProfiles } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profiles() {
  const { setProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profiles, setProfiles] = useState(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [isKid, setIsKid] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfiles()
      .then((list) => {
        setProfiles(list);
        if (!list.length) setAdding(true);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const pick = (p) => {
    setProfile(p);
    navigate(location.state?.from || "/", { replace: true });
  };

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const p = await addProfile(name, isKid);
      setProfiles((list) => [...list, p]);
      setName("");
      setIsKid(false);
      setAdding(false);
    } catch (err) {
      setError(errorMessage(err, "Couldn't add the profile"));
    }
  };

  if (!profiles) return <p className="page-message">{error || "Loading…"}</p>;

  return (
    <div className="auth-page">
      <div className="profiles">
        <span className="wordmark">HomeReel</span>
        <h1>Who's watching?</h1>
        <div className="profiles__grid">
          {profiles.map((p) => (
            <button key={p.id} className="profile" onClick={() => pick(p)}>
              <span className="profile__avatar" style={{ "--avatar": p.avatar }}>{p.name[0].toUpperCase()}</span>
              <span className="profile__name">{p.name}</span>
              {p.is_kid && <span className="label profile__kid">Kids</span>}
            </button>
          ))}
          {!adding && profiles.length < 8 && (
            <button className="profile" onClick={() => setAdding(true)}>
              <span className="profile__avatar profile__avatar--add">+</span>
              <span className="profile__name">Add profile</span>
            </button>
          )}
        </div>

        {adding && (
          <form className="profile-form" onSubmit={create}>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required autoFocus aria-label="Profile name" />
            <label className="checkbox">
              <input type="checkbox" checked={isKid} onChange={(e) => setIsKid(e.target.checked)} /> Kids profile
            </label>
            <button className="btn btn--primary" type="submit">Add</button>
            {profiles.length > 0 && <button className="btn btn--glass" type="button" onClick={() => setAdding(false)}>Cancel</button>}
          </form>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="text-link profiles__signout" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
