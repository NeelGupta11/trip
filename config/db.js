const mongoose = require("mongoose");

const atlasConn = mongoose.createConnection(
  
);

atlasConn.on("connected", () => {
  console.log("Atlas DB connected");
});

atlasConn.on("error", err => {
  console.error("Atlas DB error:", err.message);
});

module.exports = { atlasConn };