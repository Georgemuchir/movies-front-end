import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkInvite, errorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Invite() {
  const { token } = useParams();
  const { acceptInvite } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkInvite(token)
      .then((data) => {
        setInvite(data);
        setEmail(data.email || "");
      })
      .catch((err) => setError(errorMessage(err, "This invite link doesn't work.")));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== repeat) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    try {
      await acceptInvite(token, email, password);
      navigate("/profiles", { replace: true });
    } catch (err) {
      setError(err.response?.status === 429 ? "Too many attempts. Wait a minute and try again." : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="wordmark">HomeReel</span>
        <h1>{invite ? "You're invited" : "Invite"}</h1>
        {invite ? (
          <>
            <p className="muted auth-intro">Create your account to start watching.</p>
            <label>
              <span className="label">Email</span>
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
                readOnly={Boolean(invite.email)} required autoFocus={!invite.email} />
            </label>
            <label>
              <span className="label">Choose a password</span>
              <input type="password" autoComplete="new-password" minLength={10} value={password}
                onChange={(e) => setPassword(e.target.value)} required autoFocus={Boolean(invite.email)} />
            </label>
            <label>
              <span className="label">Repeat password</span>
              <input type="password" autoComplete="new-password" minLength={10} value={repeat}
                onChange={(e) => setRepeat(e.target.value)} required />
            </label>
            <p className="muted auth-note auth-note--left">At least 10 characters.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
          </>
        ) : (
          <p className={error ? "form-error" : "muted"}>{error || "Checking your invite…"}</p>
        )}
      </form>
    </div>
  );
}
