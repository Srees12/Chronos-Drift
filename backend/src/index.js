import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatgptRoute from "./chatgpt.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("ChronosFlex backend is running 🚀");
});

// ChatGPT route
app.use("/chat", chatgptRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
