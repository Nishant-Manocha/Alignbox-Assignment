require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { Pool } = require('pg');

app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();

let activeUsers = 0;

io.on('connection', async (socket) => {
  activeUsers++;
  console.log('User connected. Active users:', activeUsers);
  
  io.emit('user_count', activeUsers);
  
  try {
    const result = await pool.query(
      'SELECT * FROM messages ORDER BY created_at ASC LIMIT 100'
    );
    socket.emit('message_history', result.rows);
  } catch (error) {
    console.error('Error fetching message history:', error);
  }
  
  socket.on('chat_message', async (data) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const messageData = {
      message: data.message,
      timestamp: timestamp,
      isAnonymous: data.isAnonymous,
      username: data.isAnonymous ? 'Anonymous' : data.username,
      socketId: socket.id
    };
    
    try {
      await pool.query(
        'INSERT INTO messages (username, message, is_anonymous) VALUES ($1, $2, $3)',
        [data.isAnonymous ? 'Anonymous' : data.username, data.message, data.isAnonymous]
      );
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
    
    io.emit('chat_message', messageData);
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
