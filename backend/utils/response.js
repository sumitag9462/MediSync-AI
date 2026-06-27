/**
 * Standardize API responses
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, metadata = null) => {
    const response = {
        success: true,
        message
    };
    if (data !== null) response.data = data;
    if (metadata !== null) response.metadata = metadata;
    
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors !== null) response.errors = errors;
    
    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse
};
