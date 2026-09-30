import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProfile, updateProfile, changePassword } from "../api";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [pw, setPw] = useState({ current: "", next: "" });

  useEffect(() => { getProfile().then(setMe).catch((e) => toast.error(e.message)); }, []);
  if (!me) return <p className="muted">Loading profile…</p>;

  async function saveProfile(e) {
    e.preventDefault();
    try { setMe(await updateProfile({ name: me.name.trim(), email: me.email.trim() })); toast.success("Profile saved"); }
    catch (err) { toast.error(err.message); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pw.next.length < 8) return toast.error("New password needs at least 8 characters");
    try { await changePassword(pw.current, pw.next); setPw({ current: "", next: "" }); toast.success("Password changed"); }
    catch (err) { toast.error(err.message); }
  }

  return (
    <>
      <h1 className="title">Profile</h1>
      <div className="two">
        <form className="box form" onSubmit={saveProfile}>
          <h2>Your details</h2>
          <label>Name<input value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} required /></label>
          <p className="muted">Role: {me.role}</p>
          <button className="primary big">Save changes</button>
        </form>
        <form className="box form" onSubmit={savePassword}>
          <h2>Change password</h2>
          <label>Current password<input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></label>
          <label>New password<input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></label>
          <button className="primary big">Update password</button>
        </form>
      </div>
    </>
  );
}