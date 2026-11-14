import { useEffect, useState } from "react";
import { addAccount, createInvite, errorMessage, getAccounts, removeAccount } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function InviteLink() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setCopied(false);
    try {
      const { token, expires_at } = await createInvite(email);
      setLink({ url: `${window.location.origin}/invite/${token}`, expires: new Date(expires_at) });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="panel">
      <h3 className="panel__title">Invite link</h3>
      <p className="muted panel__text">Send a one-time link. They pick their own password. The link works once and expires in 7 days.</p>
      <form className="inline-form" onSubmit={create}>
        <input type="email" placeholder="Their email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email for the invite" />
        <button className="btn btn--primary" type="submit">Create link</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      {link && (
        <div className="invite-link">
          <input readOnly value={link.url} onFocus={(e) => e.target.select()} aria-label="Invite link" />
          <button className="btn btn--glass" type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
          <p className="muted">Expires {link.expires.toLocaleDateString()}. Send it by message or email.</p>
        </div>
      )}
    </div>
  );
}

function AddAccount({ onAdded }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const account = await addAccount(email, password, admin);
      setMessage(`Added ${account.email}. Give them their password.`);
      setEmail("");
      setPassword("");
      setAdmin(false);
      onAdded();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="panel">
      <h3 className="panel__title">Add family member</h3>
      <p className="muted panel__text">Create the account yourself and tell them the password.</p>
      <form className="inline-form" onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
        <input type="text" placeholder="Password (10+ characters)" value={password} minLength={10}
          onChange={(e) => setPassword(e.target.value)} required autoComplete="off" aria-label="Password" />
        <label className="checkbox">
          <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} /> Admin
        </label>
        <button className="btn btn--primary" type="submit">Add</button>
      </form>
      {message && <p className="muted">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  const load = () => getAccounts().then(setAccounts).catch((err) => setError(errorMessage(err)));
  useEffect(() => { load(); }, []);

  const remove = async (account) => {
    if (!window.confirm(`Remove ${account.email}? Their profiles and watch history are deleted too.`)) return;
    try {
      await removeAccount(account.id);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <h2 className="label">Family accounts</h2>
      <ul className="account-list">
        {accounts.map((a) => (
          <li key={a.id}>
            <span className="account-list__email">{a.email}</span>
            <span className={`label account-list__role ${a.role === "admin" ? "account-list__role--admin" : ""}`}>{a.role}</span>
            {a.id === user?.id ? (
              <span className="muted account-list__you">You</span>
            ) : (
              <button className="text-link" onClick={() => remove(a)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="form-error">{error}</p>}
      <div className="panels">
        <InviteLink />
        <AddAccount onAdded={load} />
      </div>
    </section>
  );
}
