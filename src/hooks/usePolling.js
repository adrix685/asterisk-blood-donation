import { useEffect, useRef } from "react";

// runs fn now and then every `ms`, skipping ticks while the tab is hidden
export default function usePolling(fn, ms) {
  const saved = useRef(fn);
  useEffect(() => { saved.current = fn; });
  useEffect(() => {
    saved.current();
    const t = setInterval(() => { if (!document.hidden) saved.current(); }, ms);
    return () => clearInterval(t);
  }, [ms]);
}