import { useEffect, useState } from "react";
import { getAudit } from "../api";
import DataTable from "../components/DataTable";

const LIMIT = 10;

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stale = false;
    setLoading(true);
    getAudit({ page, limit: LIMIT })
      .then((d) => !stale && setData(d))
      .catch((e) => !stale && setError(e.message))
      .finally(() => !stale && setLoading(false));
    return () => { stale = true; };
  }, [page]);

  const columns = [
    { key: "time", label: "When", render: (a) => new Date(a.time).toLocaleString() },
    { key: "admin", label: "Admin" },
    { key: "action", label: "Action" },
  ];

  return (
    <>
      <h1 className="title">Audit log</h1>
      <section className="box">
        {error && <p className="err" role="alert">{error}</p>}
        <DataTable caption="Admin activity" columns={columns} rows={data.items} loading={loading} empty="No activity yet."
          pager={{ page, pages: Math.max(1, Math.ceil(data.total / LIMIT)), total: data.total, onPage: setPage }} />
      </section>
    </>
  );
}