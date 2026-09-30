import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDonors, updateDonor, createDonor, GROUPS } from "../api";
import useDebounce from "../hooks/useDebounce";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

const LIMIT = 8;

export default function Donors() {
  const [q, setQ] = useState("");
  const search = useDebounce(q, 350);
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(null);
  const [toBlock, setToBlock] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    getDonors({ q: search, group, status, page, limit: LIMIT })
      .then((d) => { if (!stale) { setData(d); setError(""); } })
      .catch((e) => !stale && setError(e.message))
      .finally(() => !stale && setLoading(false));
    return () => { stale = true; };
  }, [search, group, status, page, reload]);

  async function change(id, patch, okMsg) {
    try {
      await updateDonor(id, patch);
      toast.success(okMsg);
      setReload((n) => n + 1);
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  }

  async function save(e) {
    e.preventDefault();
    if (edit.name.trim().length < 2) return toast.error("Enter the donor's name");
    if (!/^[6-9]\d{9}$/.test(edit.phone)) return toast.error("Enter a valid 10 digit mobile number");
    const { id, name, phone, group, location } = edit;
    const body = { name: name.trim(), phone, group, location };
    if (id) {
      if (await change(id, body, "Donor updated")) setEdit(null);
      return;
    }
    try {
      await createDonor(body);
      toast.success("Donor added");
      setEdit(null);
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "group", label: "Group", render: (d) => <span className="grp">{d.group}</span> },
    { key: "status", label: "Status", render: (d) => <span className={"tag " + d.status.toLowerCase()}>{d.status}</span> },
    { key: "location", label: "Location" },
    { key: "lastDonation", label: "Last donation", render: (d) => d.lastDonation || "—" },
    {
      key: "actions", label: "Actions", className: "acts",
      render: (d) => (
        <>
          <button onClick={() => setEdit({ ...d })}>View / Edit</button>
          {d.status === "Pending" && <button onClick={() => change(d.id, { status: "Available" }, "Donor verified")}>Verify</button>}
          {d.status === "Blocked"
            ? <button onClick={() => change(d.id, { status: "Available" }, "Donor unblocked")}>Unblock</button>
            : <button className="danger" onClick={() => setToBlock(d)}>Block</button>}
        </>
      ),
    },
  ];

  return (
    <>
      <h1 className="title">Donors</h1>
      <section className="box">
        <div className="toolbar">
          <input aria-label="Search donors" placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Blood group filter" value={group} onChange={(e) => { setGroup(e.target.value); setPage(1); }}>
            <option value="">All blood groups</option>
            {GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select aria-label="Status filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option>Available</option><option>Pending</option><option>Blocked</option>
          </select>
          <button className="primary" onClick={() => setEdit({ name: "", phone: "", group: "O+", location: "" })}>+ Add donor</button>
        </div>
        {error && <p className="err" role="alert">{error} <button onClick={() => setReload((n) => n + 1)}>Retry</button></p>}
        <DataTable
          caption="Donors" columns={columns} rows={data.items} loading={loading}
          empty={error ? "" : "No donors match these filters."}
          pager={{ page, pages: Math.max(1, Math.ceil(data.total / LIMIT)), total: data.total, onPage: setPage }}
        />
      </section>

      {edit && (
        <Modal title={edit.id ? "Donor details" : "Add donor"} variant="drawer" onClose={() => setEdit(null)}>
          <form onSubmit={save}>
            <label>Name<input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label>Phone<input inputMode="numeric" maxLength={10} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></label>
            <label>Blood group
              <select value={edit.group} onChange={(e) => setEdit({ ...edit, group: e.target.value })}>
                {GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>Location<input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></label>
            <div className="row">
              <button type="button" onClick={() => setEdit(null)}>Cancel</button>
              <button className="primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {toBlock && (
        <Modal title={"Block " + toBlock.name + "?"} role="alertdialog" onClose={() => setToBlock(null)}>
          <p className="muted">They will not appear in emergency matches until unblocked.</p>
          <div className="row">
            <button onClick={() => setToBlock(null)}>Cancel</button>
            <button className="primary" onClick={async () => { await change(toBlock.id, { status: "Blocked" }, "Donor blocked"); setToBlock(null); }}>Block donor</button>
          </div>
        </Modal>
      )}
    </>
  );
}