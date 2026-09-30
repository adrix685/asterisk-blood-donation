import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSettings, saveSettings } from "../api";

export default function Settings() {
  const [s, setS] = useState(null);

  useEffect(() => { getSettings().then(setS).catch((e) => toast.error(e.message)); }, []);
  if (!s) return <p className="muted">Loading settings…</p>;

  async function save(e) {
    e.preventDefault();
    const gap = Number(s.minDonationGapDays), low = Number(s.lowStockThreshold);
    if (!(gap >= 30 && gap <= 365)) return toast.error("Donation gap must be between 30 and 365 days");
    if (!(low >= 0)) return toast.error("Low stock limit cannot be negative");
    try { setS(await saveSettings({ ...s, minDonationGapDays: gap, lowStockThreshold: low })); toast.success("Settings saved"); }
    catch (err) { toast.error(err.message); }
  }

  return (
    <>
      <h1 className="title">Settings</h1>
      <form className="box form narrow" onSubmit={save}>
        <label>Minimum days between donations
          <input type="number" value={s.minDonationGapDays} onChange={(e) => setS({ ...s, minDonationGapDays: e.target.value })} />
        </label>
        <label>Low stock warning (units)
          <input type="number" value={s.lowStockThreshold} onChange={(e) => setS({ ...s, lowStockThreshold: e.target.value })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.alertSound} onChange={(e) => setS({ ...s, alertSound: e.target.checked })} />
          Play a sound for new critical requests
        </label>
        <button className="primary big">Save settings</button>
      </form>
    </>
  );
}