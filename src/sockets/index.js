let io;

function initSockets(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    // Client joins their personal room on connect
    socket.on('join_room', ({ room }) => {
      if (room && typeof room === 'string') {
        socket.join(room);
      }
    });

    socket.on('disconnect', () => {
      // Cleanup handled automatically by Socket.io
    });
  });
}

function getIo() {
  return io;
}

module.exports = { initSockets, getIo };
