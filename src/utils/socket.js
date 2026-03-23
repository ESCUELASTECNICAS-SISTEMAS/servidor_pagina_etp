// socket.js
let io = null;

function init(server) {
  const socketio = require('socket.io');
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}

module.exports = { init, getIO };
