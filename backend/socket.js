let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:5174',
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('--- Socket Connection ---');
      console.log('Client connected:', socket.id);
      
      socket.on('join_admin_room', () => {
        socket.join('admin_room');
        console.log(`Socket ${socket.id} joined admin_room`);
        // Log current room members for debugging
        const room = io.sockets.adapter.rooms.get('admin_room');
        console.log(`Current admin_room size: ${room ? room.size : 0}`);
      });

      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'Reason:', reason);
      });

      socket.on('error', (error) => {
        console.error('Socket error for', socket.id, ':', error);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
