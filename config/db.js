const mongoose = require("mongoose");

const atlasConn = mongoose.createConnection(
  "mongodb://127.0.0.1:27017/trip_taker"
);

atlasConn.on("connected", () => {
  console.log("Atlas DB connected");
});

atlasConn.on("error", err => {
  console.error("Atlas DB error:", err.message);
});

module.exports = { atlasConn };