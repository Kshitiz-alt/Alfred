import express from "express";
import cors from "cors";
import { AiAgent } from "./AiAgent.js";

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", // ✅ your vite frontend
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("✅ Alfred backend is alive!");
});


app.post("/ai", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await AiAgent(message);
    res.json(reply);
  } catch (err) {
    console.error("couldn't recieve data", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
