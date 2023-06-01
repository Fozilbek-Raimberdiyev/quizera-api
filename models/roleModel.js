const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
});

const Role = mongoose.model("roles", roleSchema);
