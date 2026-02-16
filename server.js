const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./src/routes/userRoutes");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use("/api/users", userRoutes);

app.get('/', (req, res) => {
  res.json({ message: "API Running Successfully 🚀" });
});

// Socket
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("send_location", (data) => {
    console.log("Location received:", data);

    socket.broadcast.emit("receive_location", {
    id: socket.id,
    latitude: data.latitude,
    longitude: data.longitude
  });

  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user_disconnected", socket.id);
  });

});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
