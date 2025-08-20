const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    projectDate: { type: Date },          // “Date of the Project”
    topic: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    madeBy: { type: String, default: "" }, // owner / team
    startDate: { type: Date },
    completeDate: { type: Date },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Helpful compound index for sorts & searches
ProjectSchema.index({ createdAt: -1, topic: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
