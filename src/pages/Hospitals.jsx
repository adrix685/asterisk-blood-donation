import { useEffect, useMemo, useState } from "react";
import { getHospitals } from "../api";
import DataTable from "../components/DataTable";

export default function Hospitals() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHospitals()
      .then((data) => setList(Array.isArray(data) ? data : data?.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (h) =>
        h.name?.toLowerCase().includes(t) ||
        h.city?.toLowerCase().includes(t) ||
        h.address?.toLowerCase().includes(t)
    );
  }, [list, q]);

  const columns = [
    { key: "name", label: "Hospital" },
    { key: "city", label: "City", render: (h) => h.city || h.address || "—" },
    { key: "phone", label: "Phone", render: (h) => h.phone || "—" },
    { key: "contact", label: "Blood bank contact", render: (h) => h.contact || "—" },
    { key: "openRequests", label: "Open requests", render: (h) => h.openRequests ?? 0 },
  ];

  return (
    <>
      <h1 className="title">Hospitals</h1>
      <section className="box">
        <div className="toolbar">
          <input
            aria-label="Search hospitals"
            placeholder="Search by hospital or city"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <DataTable
          caption="Partner hospitals"
          columns={columns}
          rows={rows}
          loading={loading}
          empty="No hospitals found."
        />
      </section>
    </>
  );
}