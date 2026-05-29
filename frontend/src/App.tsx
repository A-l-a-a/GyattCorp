import './App.css'
import { useSSE } from "./useSSE";

export default function App() {
  const { state, start } = useSSE();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-xl font-mono font-bold tracking-wider">SSE Tracker</h1>

      {/* status pill */}
      <span
        className={`text-xs px-3 py-1 rounded-full font-mono ${
          state.connected
            ? "bg-green-900 text-green-300"
            : state.error
            ? "bg-red-900 text-red-300"
            : state.done
            ? "bg-blue-900 text-blue-300"
            : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {state.connected
          ? "● connected"
          : state.error
          ? "✕ error"
          : state.done
          ? "✓ done"
          : "○ idle"}
      </span>

      {/* start button */}
      <button
        onClick={start}
        disabled={state.connected}
        className="px-6 py-2 bg-zinc-100 text-zinc-900 font-mono text-sm rounded disabled:opacity-40 hover:bg-white transition-colors"
      >
        Run operation
      </button>

      {/* progress bar */}
      <div className="w-full max-w-md bg-zinc-800 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${state.progress}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 font-mono">{state.progress}%</span>

      {/* event log */}
      {state.log.length > 0 && (
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
          {state.log.map((entry, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-zinc-600 shrink-0">{entry.ts}</span>
              <span className="text-zinc-300">{entry.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* error */}
      {state.error && (
        <p className="text-red-400 font-mono text-sm">{state.error}</p>
      )}
    </div>
  );
}