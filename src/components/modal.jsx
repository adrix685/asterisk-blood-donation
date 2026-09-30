import { useEffect, useId, useRef } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';

// Accessible dialog/drawer: focus moves in, Tab stays inside, Esc closes, focus returns to the opener.
export default function Modal({ title, onClose, variant = "dialog", role = "dialog", children }) {
  const box = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const opener = document.activeElement;
    (box.current.querySelector(FOCUSABLE) || box.current).focus();
    return () => opener && opener.focus && opener.focus();
  }, []);

  function onKeyDown(e) {
    if (e.key === "Escape") return onClose();
    if (e.key !== "Tab") return;
    const items = [...box.current.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className={"overlay" + (variant === "dialog" ? " center" : "")} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} className={variant === "drawer" ? "drawer" : "dialog"} role={role} aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKeyDown}>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}