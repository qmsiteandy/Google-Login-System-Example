const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  googleID: { type: String },
  data: { type: Date, default: Date.now() },
  thumbnail: { type: String },
  email: { type: String },
  password: { type: String, minLength: 6 },
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
