import { useEffect, useState } from "react";
import { getStats, getSettings, GROUPS } from "../api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(3);

  useEffect(() => {
    getStats().then(setS).catch((e) => setError(e.message));
    getSettings().then((c) => setLimit(c.lowStockThreshold)).catch(() => {});
  }, []);

  if (error) return <p className="err">{error}</p>;
  if (!s) return <div className="cards">{[1, 2, 3, 4].map((i) => <div key={i} className="card skeleton" />)}</div>;

  return (
    <>
      <h1 className="title">Dashboard</h1>
      <section className="cards">
        <StatCard label="Total donors" value={s.total} />
        <StatCard label="Available donors" value={s.available} tone="green" />
        <StatCard label="Pending verification" value={s.pending} tone="amber" />
        <StatCard label="Active emergencies" value={s.activeEmergencies} tone="red" />
      </section>
      <div className="two">
        <section className="box">
          <h2>Blood inventory (units)</h2>
          <div className="inv">
            {GROUPS.map((g) => (
              <div key={g} className={"unit" + ((s.inventory[g] ?? 0) <= limit ? " low" : "")}>
                <b>{g}</b><span>{s.inventory[g] ?? 0}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="box">
          <h2>Recent activity</h2>
          <ul className="feed">
            {s.activity.map((a) => <li key={a.id}>{a.text}<span>{a.time}</span></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}