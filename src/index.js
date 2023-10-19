require('dotenv').config();
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);

// new instance of socket.io
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

let msg = 'Welcome!';

// Printing a message when client connects
io.on('connection', (socket) => {
  console.log('New Websocket connection');

  // server listening for join event from client
  socket.on('join', ({ username, room }, callBack) => {
    // Add a user
    try {
      const user = addUser({ id: socket.id, username, room });
      // console.log(user.id);
      // console.log(user.room);
      // using socket.io fearture to join room
      socket.join(user.room);
      // server sendind data to client
      socket.emit('welcomeMsg', generateMessage('Admin', msg));
      // broadcasting data to clients in the room
      socket.broadcast
        .to(user.room)
        .emit(
          'welcomeMsg',
          generateMessage('Admin', `${user.username} has joined!`)
        );
      // emiting room data to client
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    } catch (error) {
      callBack(error);
    }
  });

  // Server listening to event from client
  socket.on('sendMessage', (message, callBack) => {
    // get user
    const id = socket.id;
    const user = getUser(id);
    // console.log(user);
    // console.log(user['room']);
    // Initalize bad-words
    const filter = new Filter();
    if (filter.isProfane(message)) return callBack('Profanity not allowed');
    // Server emits (sends) data so the client and emitting to every connection available
    io.to(user['room']).emit(
      'welcomeMsg',
      generateMessage(user.username, message)
    );
    callBack();
  });

  // server listens for location data from client
  socket.on('sendLocation', (location, callBack) => {
    const id = socket.id;
    const user = getUser(id);
    // console.log(user['room']);
    // console.log(location);
    const lat = location.latitude;
    const long = location.longitude;
    // server emits location to every connected cleint in same room
    io.to(user['room']).emit(
      'locationMessage',
      generateLocationMessage(
        user['username'],
        `https://google.com/maps?q=${lat},${long}`
      )
    );
    callBack();
  });

  // sending message to connected client when a user leaves
  socket.on('disconnect', () => {
    const id = socket.id;
    const user = removeUser(id);
    if (!user) return;
    io.to(user.room).emit(
      'welcomeMsg',
      generateMessage('Admin', `${user.username} has left`)
    );
    // sending roomData when a client leaves
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

server.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
