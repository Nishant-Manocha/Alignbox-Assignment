const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  console.log('User connected. Active users:', activeUsers);
  
  io.emit('user_count', activeUsers);
  
  socket.on('chat_message', (data) => {
    io.emit('chat_message', {
      message: data.message,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isAnonymous: data.isAnonymous,
      username: data.username || 'Anonymous',
      socketId: socket.id
    });
  });
  
  socket.on('user_joined', (data) => {
    io.emit('user_joined', {
      username: data.username || 'Anonymous',
      socketId: socket.id
    });
  });
  
  socket.on('disconnect', () => {
    activeUsers--;
    console.log('User disconnected. Active users:', activeUsers);
    io.emit('user_count', activeUsers);
  });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
