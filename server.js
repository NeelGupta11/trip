const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();
const { createServer } = require("http");
const socketIO = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const SignUppage = require("./routes/SignUppagepost");
const CreateGroupPost=require("./routes/CreateGroupPost")
const JoinGroupPost=require("./routes/JoinGroupPost")
const LeaveGroupPost=require("./routes/LeaveGroupPost")
const locationRoutes=require("./routes/locationRoutes")
const getgrouplocation=require("./routes/getgrouplocation")
const getpersonlocation=require("./routes/getpersonlocation")
const LoginPost=require("./routes/LoginPost")
const get_userRoutes = require("./routes/get_userdetail");
const getgroups=require("./routes/getgroups")
const { atlasConn } = require('./config/db');
const setupLocationSocket = require("./sockets/locationSocket");

const app = express();
const server = http.createServer(app);
// const httpServer = createServer(app);

const io = socketIO(server) 
// new Server(httpServer, {
//   cors: { origin: "*" }
//});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use(SignUppage)
app.use(CreateGroupPost)
app.use(JoinGroupPost)
app.use(LeaveGroupPost)
app.use(locationRoutes)
app.use(getgrouplocation)
app.use(getpersonlocation)
app.use(LoginPost)
app.use(getgroups)
app.use(get_userRoutes);

app.get('/', (req, res) => {
  res.json({ message: "API Running Successfully 🚀" });
});

// Setup Socket
setupLocationSocket(io);

const PORT = process.env.PORT || 3000;

// httpServer.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});