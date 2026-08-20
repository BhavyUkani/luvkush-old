"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../utils/config");
const error_middleware_1 = require("./error.middleware");
const storage = multer_1.default.memoryStorage();
// A quick, cheap first pass — rejects obviously wrong uploads before the
// bytes are even fully read off the wire. This alone is NOT a security
// control: `file.mimetype` is just the client-declared multipart
// Content-Type, trivially spoofed by anyone sending the request directly
// (see verifyImageContent below for the check that actually matters).
const fileFilter = (_req, file, cb) => {
    if (config_1.config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new error_middleware_1.AppError(`Invalid file type. Allowed: ${config_1.config.upload.allowedTypes.join(', ')}`, 400));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: config_1.config.upload.maxSize }
});
// Mimetype -> the format name sharp/libvips reports after actually decoding
// the bytes. Only formats reachable via config.upload.allowedTypes matter.
const MIME_TO_SHARP_FORMAT = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'heif'
};
/** Runs after multer has buffered the upload — decodes each file with sharp
 * (libvips) and checks the *actual* image format against the declared
 * mimetype, so a renamed .php/.html/.svg-with-script can't ride through on
 * a spoofed Content-Type the way file.mimetype alone would allow. */
const verifyImageContent = async (req, _res, next) => {
    const files = req.file ? [req.file] : req.files || [];
    try {
        for (const file of files) {
            const expectedFormat = MIME_TO_SHARP_FORMAT[file.mimetype];
            let metadata;
            try {
                metadata = await (0, sharp_1.default)(file.buffer).metadata();
            }
            catch {
                throw new error_middleware_1.AppError(`"${file.originalname}" is not a valid image file`, 400);
            }
            if (!expectedFormat || metadata.format !== expectedFormat) {
                throw new error_middleware_1.AppError(`"${file.originalname}" does not match its declared file type`, 400);
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
const uploadMiddleware = (fieldName, maxCount = 1) => {
    return [upload.array(fieldName, maxCount), verifyImageContent];
};
exports.uploadMiddleware = uploadMiddleware;
const uploadSingleMiddleware = (fieldName) => {
    return [upload.single(fieldName), verifyImageContent];
};
exports.uploadSingleMiddleware = uploadSingleMiddleware;
//# sourceMappingURL=upload.middleware.js.map