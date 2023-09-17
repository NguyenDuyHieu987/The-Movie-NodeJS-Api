"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
const ErrorHandler = (error, req, res, next) => {
    let statusCode = error?.status || error?.statusCode || 500;
    let errorMessage = error?.message || error?.body?.message || 'An unknown error occurred';
    if ((0, http_errors_1.isHttpError)(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({
        status: statusCode,
        message: errorMessage,
    });
};
exports.default = ErrorHandler;
//# sourceMappingURL=errorController.js.map