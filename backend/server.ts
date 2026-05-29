import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const steps = [
  "Validating input...",
  "Fetching resources...",
  "Processing data...",
  "Running analysis...",
  "Writing results...",
  "Finalizing...",
];

app.post("/api/start", (_req, res) => {
  const id = uuid();
  res.status(202).json({ id });
});

// SSE stream endpoint
app.get("/api/stream", (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).end();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let i = 0;

  const send = (event: string, data: object) => {
    // SSE format: event line + data line + blank line
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const tick = setInterval(() => {
    if (i < steps.length) {
      send("step", {
        index: i,
        total: steps.length,
        message: steps[i],
      });
      i++;
    } else {
      send("complete", { message: "Done." });
      clearInterval(tick);
      res.end();
    }
  }, 1200);

  req.on("close", () => clearInterval(tick));
});

app.listen(3001, () => console.log("http://localhost:3001"));