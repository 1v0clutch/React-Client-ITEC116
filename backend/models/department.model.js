const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  head: { 
    type: String, 
    required: false,
    trim: true,
    default: ""
  },
  description: { 
    type: String,
    trim: true,
    default: ""
  },
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Department", DepartmentSchema);
