import { useState } from "react";
import { toast } from "react-toastify";
import { getEmergencies, updateEmergency, assignDonor } from "../api";
import usePolling from "../hooks/usePolling";
import DataTable from "../components/DataTable";

export default function Emergencies() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    getEmergencies()
      .then((d) => { setList(d); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  usePolling(load, 20000);

  async function run(id, action, okMsg) {
    setBusyId(id);
    try {
      await action();
      toast.success(okMsg);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const critical = list.filter((e) => e.status === "Critical").length;

  const columns = [
    { key: "patient", label: "Patient", render: (e) => <>{e.status === "Critical" && <span aria-hidden="true">🚨 </span>}{e.patient}</> },
    { key: "hospital", label: "Hospital" },
    { key: "group", label: "Group", render: (e) => <span className="grp">{e.group}</span> },
    { key: "units", label: "Units" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status", render: (e) => <>{e.status}{e.assignedTo && ` · ${e.assignedTo}`}</> },
    {
      key: "actions", label: "Actions", className: "acts",
      render: (e) => (
        <>
          {e.status === "Critical" && <button disabled={busyId === e.id} onClick={() => run(e.id, () => updateEmergency(e.id, { status: "Open" }), "Request verified")}>Verify</button>}
          {(e.status === "Open" || e.status === "Critical") && <button disabled={busyId === e.id} onClick={() => run(e.id, () => assignDonor(e.id), "Donor assigned")}>Assign donor</button>}
          {e.status !== "Resolved" && <button disabled={busyId === e.id} onClick={() => run(e.id, () => updateEmergency(e.id, { status: "Resolved" }), "Request resolved")}>Resolve</button>}
        </>
      ),
    },
  ];

  return (
    <>
      <h1 className="title">Emergencies</h1>
      {critical > 0 && <div className="banner" role="status">🚨 {critical} critical request{critical > 1 ? "s" : ""} waiting for action</div>}
      {error && <p className="err" role="alert">{error} <button onClick={load}>Retry</button></p>}
      <section className="box">
        <DataTable caption="Blood requests" columns={columns} rows={list} loading={loading}
          rowClass={(e) => (e.status === "Critical" ? "hot" : "")} empty={error ? "" : "No blood requests right now."} />
      </section>
    </>
  );
}