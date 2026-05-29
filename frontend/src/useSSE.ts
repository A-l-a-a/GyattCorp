import { useCallback, useRef, useState } from "react";

interface StepEvent {
  index: number;
  total: number;
  message: string;
}

interface LogEntry {
  ts: string;
  message: string;
}

interface SSEState {
  connected: boolean;
  progress: number; // 0-100
  log: LogEntry[];
  done: boolean;
  error: string | null;
}

export function useSSE() {
  const esRef = useRef<EventSource | null>(null);
  const [state, setState] = useState<SSEState>({
    connected: false,
    progress: 0,
    log: [],
    done: false,
    error: null,
  });

  const start = useCallback(async () => {
    esRef.current?.close();
    setState({ connected: false, progress: 0, log: [], done: false, error: null });

    // 1. POST to get an ID
    const res = await fetch("http://localhost:3001/api/start", { method: "POST" });
    const { id } = await res.json();

    // 2. Open SSE connection with that ID
    const es = new EventSource(`http://localhost:3001/api/stream?id=${id}`);
    esRef.current = es;

    setState((s) => ({ ...s, connected: true }));

    es.addEventListener("step", (e) => {
      const data: StepEvent = JSON.parse(e.data);
      setState((s) => ({
        ...s,
        progress: Math.round(((data.index + 1) / data.total) * 100),
        log: [...s.log, { ts: new Date().toLocaleTimeString(), message: data.message }],
      }));
    });

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data);
      setState((s) => ({
        ...s,
        connected: false,
        done: true,
        progress: 100,
        log: [...s.log, { ts: new Date().toLocaleTimeString(), message: data.message }],
      }));
      es.close();
    });

    es.onerror = () => {
      setState((s) => ({ ...s, connected: false, error: "Connection lost." }));
      es.close();
    };
  }, []);

  return { state, start };
}