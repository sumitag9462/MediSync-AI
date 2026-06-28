const { Server } = require('socket.io');
const logger = require('../utils/logger');
const env = require('../config/env');

let io;

class SocketService {
    init(server) {
        io = new Server(server, {
            cors: {
                origin: function(origin, callback) { callback(null, true); },
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            logger.info(`Socket connected: ${socket.id}`);

            // A user joins their own personal room to receive private notifications
            socket.on('join_user_room', (userId) => {
                socket.join(`user_${userId}`);
                logger.info(`Socket ${socket.id} joined user_${userId}`);
            });

            // A user joins a workspace room (for caregiver/doctor collaboration)
            socket.on('join_workspace_room', (workspaceId) => {
                socket.join(`workspace_${workspaceId}`);
                logger.info(`Socket ${socket.id} joined workspace_${workspaceId}`);
            });

            socket.on('disconnect', () => {
                logger.info(`Socket disconnected: ${socket.id}`);
            });
        });

        return io;
    }

    getIO() {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }

    emitToUser(userId, event, data) {
        if (io) {
            io.to(`user_${userId}`).emit(event, data);
        }
    }

    emitToWorkspace(workspaceId, event, data) {
        if (io) {
            io.to(`workspace_${workspaceId}`).emit(event, data);
        }
    }
}

module.exports = new SocketService();
