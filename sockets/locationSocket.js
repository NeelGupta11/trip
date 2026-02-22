const UserLocation = require("../models/UserLocationModels");
const User = require("../models/UserSignUpmodel");
const mongoose = require("mongoose");

const setupLocationSocket = (io) => {

  io.on("connection", async (socket) => {

    const { userId } = socket.handshake.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      socket.disconnect();
      return;
    }

    console.log("User connected:", userId);

    socket.join(userId);

    socket.on("join_group", (groupId) => {
      socket.join(groupId);
    });

    socket.on("send_location", async (data) => {
      try {

        const { latitude, longitude, groupId } = data;

        const location = await UserLocation.findOneAndUpdate(
          { user: userId },
          { latitude, longitude },
          { returnDocument: "after", upsert: true }
        );

        const user = await User.findById(userId).select("firstName");

        const payload = {
          userId,
          name: user?.firstName || "Unknown",
          latitude,
          longitude,
          lastSeen: location.updatedAt
        };

        // ✅ Send to everyone EXCEPT sender
        socket.to(groupId).emit("receive_location", payload);

      } catch (err) {
        console.error("Socket location error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);

      // Send disconnect only to groups the user was part of
      socket.broadcast.emit("user_disconnected", {
        userId,
        lastSeen: new Date()
      });
    });

  });
};

module.exports = setupLocationSocket;