const { errorResponse } = require('../utils/response');

/**
 * Enforces Role-Based Access Control for specific routes.
 * Must be used AFTER the standard `protect` authentication middleware.
 * @param {...string} allowedRoles - Array of roles permitted to access the route.
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated.');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 403, `Role '${req.user.role}' is not authorized to access this resource.`);
        }

        next();
    };
};

module.exports = { authorize };
