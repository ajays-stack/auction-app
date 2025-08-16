const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Join auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      socket.emit('joined_auction', { auctionId });
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      socket.emit('left_auction', { auctionId });
    });

    // Handle heartbeat for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = { handleConnection };