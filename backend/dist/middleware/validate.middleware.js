"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("./error.middleware");
/** Runs after an express-validator chain — collects any accumulated
 * validation errors and turns them into the same AppError/400 shape every
 * other rejected request in this API already returns, instead of each
 * route hand-rolling its own truthy checks. */
const validate = (req, _res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (result.isEmpty())
        return next();
    const message = result.array({ onlyFirstError: true })
        .map(err => err.msg)
        .join('; ');
    next(new error_middleware_1.AppError(message, 400));
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map