import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStats, getSettings, setUnauthorizedHandler } from "./api";
import { playAlert } from "./utils/alertSound";
import usePolling from "./hooks/usePolling";
import Login from "./Login";
import Dashboard from "./pages/Deshboard";
import Donors from "./pages/Donors";
import Emergencies from "./pages/Emergencies";
import Hospitals from "./pages/Hospitals";
import AuditLog from "./pages/AuditLog";
import Profile from "./pages/Profile";
import Settings from "./pages/Setting";
import "./admin.css";

const NAV = [
  ["/", "Dashboard"], ["/donors", "Donors"], ["/emergencies", "Emergencies"],
  ["/hospitals", "Hospitals"], ["/audit", "Audit log"], ["/profile", "Profile"], ["/settings", "Settings"],
];

// white by default; night mode is optional and remembers the choice
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}

function Layout({ onLogout, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [critical, setCritical] = useState(0);

  const prev = useRef(null);
  usePolling(async () => {
    try {
      const [s, cfg] = await Promise.all([getStats(), getSettings()]);
      // beep only when the count goes up, and never on the first load
      if (cfg.alertSound && prev.current !== null && s.activeEmergencies > prev.current) playAlert();
      prev.current = s.activeEmergencies;
      setCritical(s.activeEmergencies);
    } catch {
      // the badge just keeps its last value
    }
  }, 30000);

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <aside className={"side" + (open ? " open" : "")}>
        <div className="brand"><span className="drop" aria-hidden="true" />LifeLink <small>Admin</small></div>
        <nav aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
              {label}
              {label === "Emergencies" && critical > 0 && <b className="pill" aria-label={critical + " active"}>{critical}</b>}
            </NavLink>
          ))}
        </nav>
        <button className="logout" onClick={onLogout}>Log out</button>
      </aside>
      <main id="main" tabIndex={-1}>
        <header className="top">
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>☰</button>
          <span className="grow" />
          <button className="icon" onClick={toggleTheme} aria-pressed={theme === "dark"} aria-label="Night mode">{theme === "dark" ? "☀️" : "🌙"}</button>
          <span className="bell" role="img" aria-label={critical + " active emergencies"}>🔔{critical > 0 && <i />}</span>
          <span className="avatar" aria-hidden="true">AD</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function Shell() {
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();
  const [authed, setAuthed] = useState(!!sessionStorage.getItem("adminToken"));

  const logout = () => { sessionStorage.removeItem("adminToken"); setAuthed(false); navigate("/"); };
  useEffect(() => setUnauthorizedHandler(() => setAuthed(false)), []);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;
  return (
    <Routes>
      <Route element={<Layout onLogout={logout} theme={theme} toggleTheme={toggleTheme} />}>
        <Route index element={<Dashboard />} />
        <Route path="donors" element={<Donors />} />
        <Route path="emergencies" element={<Emergencies />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
      {/* role="status" makes toasts polite live-region announcements for screen readers */}
      <ToastContainer position="top-right" autoClose={4500} role="status" />
    </BrowserRouter>
  );
}