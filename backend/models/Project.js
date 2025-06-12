// filepath: /backend/models/Project.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  link: { type: String },
  image: { type: String },
});

module.exports = mongoose.model('Project', ProjectSchema);