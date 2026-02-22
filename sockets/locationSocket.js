// const setupLocationSocket = (io) => {
//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("send_location", (data) => {
//       console.log("Location received:", data);

//       socket.broadcast.emit("receive_location", {
//         id: socket.id,
//         latitude: data.latitude,
//         longitude: data.longitude,
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//       socket.broadcast.emit("user_disconnected", socket.id);
//     });
//   });
// };

// module.exports = setupLocationSocket;

const UserLocation = require("../models/UserLocationModels");
const User = require("../models/UserSignUpmodel"); // your user model
const mongoose = require("mongoose");

const setupLocationSocket = (io) => {

  io.on("connection", async (socket) => {

    const { userId } = socket.handshake.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      socket.disconnect();
      return;
    }

    console.log("User connected:", userId);

    // ✅ Join personal room (optional but useful)
    socket.join(userId);

    socket.on("join_group", (groupId) => {
      socket.join(groupId);
    });

    socket.on("send_location", async (data) => {
      try {

        const { latitude, longitude, groupId } = data;
   
        // ✅ 1. Save location in DB
        const location = await UserLocation.findOneAndUpdate(
          { user: userId },
          { latitude, longitude },
          { returnDocument: 'after', upsert: true } // ✅ 2026 Recommended way
        );

        // ✅ 2. Get user details
        const user = await User.findById(userId).select("firstName");

        const payload = {
          userId,
          name: user?.firstName || "Unknown",
          latitude,
          longitude,
          lastSeen: location.updatedAt
        };

        // ✅ 3. Emit only to group
        io.to(groupId).emit("receive_location", payload);

      } catch (err) {
        console.error("Socket location error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);

      socket.broadcast.emit("user_disconnected", {
        userId,
        lastSeen: new Date()
      });
    });

  });
};

module.exports = setupLocationSocket;