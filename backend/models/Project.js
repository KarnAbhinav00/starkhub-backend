const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectDate: { type: Date },
    topic: { type: String, required: true },
    description: { type: String },
    madeBy: { type: String },
    startDate: { type: Date },
    completeDate: { type: Date },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
