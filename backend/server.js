require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Project = require("./models/Project");

const app = express();

// ---------- Middleware ----------
const allowed = (process.env.ALLOW_ORIGIN || "*")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin || allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

// ---------- MongoDB ----------
const mongoOpts = { dbName: process.env.DB_NAME || "StarksDB" };

mongoose
  .connect(process.env.MONGO_URI, mongoOpts)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ---------- Helpers ----------
const pickProjectFields = (body) => {
  const { projectDate, topic, description, madeBy, startDate, completeDate, completed } = body;
  return {
    ...(projectDate ? { projectDate } : {}),
    ...(topic !== undefined ? { topic } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(madeBy !== undefined ? { madeBy } : {}),
    ...(startDate ? { startDate } : {}),
    ...(completeDate ? { completeDate } : {}),
    ...(typeof completed === "boolean" ? { completed } : {})
  };
};

// ---------- Routes ----------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), time: new Date().toISOString() });
});

// List projects
app.get("/api/projects", async (req, res) => {
  try {
    const { q = "", sort = "createdAt", dir = "desc" } = req.query;
    const filter = q
      ? {
          $or: [
            { topic: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { madeBy: { $regex: q, $options: "i" } }
          ]
        }
      : {};
    const sortMap = {};
    sortMap[sort] = dir === "asc" ? 1 : -1;
    const projects = await Project.find(filter).sort(sortMap).lean();
    res.json(projects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Create project
app.post("/api/projects", async (req, res) => {
  try {
    const data = pickProjectFields(req.body);
    if (!data.topic || !data.topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }
    const project = await Project.create(data);
    res.status(201).json(project);
  } catch (err) {
    console.error("POST /api/projects error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
app.put("/api/projects/:id", async (req, res) => {
  try {
    const data = pickProjectFields(req.body);
    const updated = await Project.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Team route
app.get("/api/team", (req, res) => {
  res.json([
    { 
      name: "Abhinav", 
      role: "Team Leader", 
      skills: ["Tech Enthusiastic", "AI Enthusiastic"],
      class: "9",
      school: "PM SHREE KENDRIYA VIDYALAYA JANAKPURI",
      contact: "abhii9av.072@gmail.com"
    },
    { name: "Abhinav Shukla", role: "Software Specialist", skills: ["Designer Enthusiastic", "AI Enthusiastic"] },
    { name: "Samyak Katyayan", role: "Hardware Specialist", skills: ["Hardware Enthusiastic"] },
    { name: "Aditya Kumar", role: "Hardware Specialist", skills: ["Hardware Enthusiastic"] },
    { name: "Atul Kumar", role: "Learning Guy | Researcher", skills: ["Unknown"] }
  ]);
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
