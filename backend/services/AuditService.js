const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditService {
    /**
     * Logs a critical action to the AuditLog database and standard logger.
     */
    async logAction(userId, action, resource, req, result = 'success', details = {}) {
        try {
            const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
            const deviceInfo = req?.headers?.['user-agent'] || 'unknown';
            
            await AuditLog.create({
                user: userId,
                action,
                resource,
                ipAddress,
                deviceInfo,
                result,
                details
            });

            logger.info(`AUDIT [${result.toUpperCase()}]: User ${userId} performed ${action} on ${resource}`);
        } catch (error) {
            logger.error('Failed to write audit log:', error);
        }
    }
}

module.exports = new AuditService();
