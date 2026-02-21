const mongoose = require("mongoose");

const atlasConn = mongoose.createConnection(
  "mongodb+srv://nguptaneelg_db_user:kqmsh6lHbihve2nk@trip.k78upxs.mongodb.net/?appName=trip"
);

atlasConn.on("connected", () => {
  console.log("Atlas DB connected");
});

atlasConn.on("error", err => {
  console.error("Atlas DB error:", err.message);
});

module.exports = { atlasConn };