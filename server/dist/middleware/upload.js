"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUploadedFiles = exports.setUploadFolder = exports.uploadFile = exports.uploadDocument = exports.uploadProfilePhoto = exports.uploadVisitorFiles = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const environment_1 = __importDefault(require("@/config/environment"));
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const s3Client = new client_s3_1.S3Client({
    region: environment_1.default.AWS_REGION,
    credentials: {
        accessKeyId: environment_1.default.AWS_ACCESS_KEY_ID,
        secretAccessKey: environment_1.default.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.CONTABO_S3_ENDPOINT || 'https://eu2.contabostorage.com',
    forcePathStyle: true,
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = environment_1.default.UPLOAD_ALLOWED_TYPES;
    if (!allowedTypes.includes(file.mimetype)) {
        logger_1.logger.warn('File type not allowed', {
            filename: file.originalname,
            mimetype: file.mimetype,
            allowedTypes
        });
        return cb(new errors_1.AppError(`File type ${file.mimetype} not allowed`, 400));
    }
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv', '.xlsx', '.xls'];
    if (!allowedExtensions.includes(ext)) {
        logger_1.logger.warn('File extension not allowed', {
            filename: file.originalname,
            extension: ext
        });
        return cb(new errors_1.AppError(`File extension ${ext} not allowed`, 400));
    }
    cb(null, true);
};
const generateFileName = (req, file, folder = 'general') => {
    const ext = path_1.default.extname(file.originalname);
    const name = path_1.default.basename(file.originalname, ext);
    const timestamp = Date.now();
    const uuid = (0, uuid_1.v4)().substring(0, 8);
    const companyId = req.company?._id || 'unknown';
    return `${folder}/${companyId}/${name}-${timestamp}-${uuid}${ext}`;
};
const s3Storage = (0, multer_s3_1.default)({
    s3: s3Client,
    bucket: environment_1.default.AWS_S3_BUCKET,
    acl: 'private',
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
        const folder = req.uploadFolder || 'general';
        const fileName = generateFileName(req, file, folder);
        cb(null, fileName);
    },
    metadata: (req, file, cb) => {
        cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedBy: req.user?._id?.toString() || 'unknown',
            companyId: req.company?._id?.toString() || 'unknown',
            uploadDate: new Date().toISOString()
        });
    }
});
const baseUploadConfig = {
    storage: s3Storage,
    fileFilter,
    limits: {
        fileSize: environment_1.default.UPLOAD_MAX_FILE_SIZE,
        files: 10,
        fields: 20,
    }
};
const uploadSingle = (fieldName, folder) => {
    return (req, res, next) => {
        if (folder) {
            req.uploadFolder = folder;
        }
        const upload = (0, multer_1.default)(baseUploadConfig).single(fieldName);
        upload(req, res, (err) => {
            if (err) {
                logger_1.logger.error('Single file upload error', { error: err, fieldName, folder });
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return next(new errors_1.AppError('File size too large', 413));
                    }
                    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                        return next(new errors_1.AppError('Unexpected file field', 400));
                    }
                }
                return next(err);
            }
            next();
        });
    };
};
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName, maxCount = 5, folder) => {
    return (req, res, next) => {
        if (folder) {
            req.uploadFolder = folder;
        }
        const upload = (0, multer_1.default)(baseUploadConfig).array(fieldName, maxCount);
        upload(req, res, (err) => {
            if (err) {
                logger_1.logger.error('Multiple files upload error', { error: err, fieldName, maxCount, folder });
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return next(new errors_1.AppError('File size too large', 413));
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return next(new errors_1.AppError('Too many files', 400));
                    }
                }
                return next(err);
            }
            next();
        });
    };
};
exports.uploadMultiple = uploadMultiple;
const uploadFields = (fields, folder) => {
    return (req, res, next) => {
        if (folder) {
            req.uploadFolder = folder;
        }
        const upload = (0, multer_1.default)(baseUploadConfig).fields(fields);
        upload(req, res, (err) => {
            if (err) {
                logger_1.logger.error('Fields upload error', { error: err, fields, folder });
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return next(new errors_1.AppError('File size too large', 413));
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return next(new errors_1.AppError('Too many files', 400));
                    }
                }
                return next(err);
            }
            next();
        });
    };
};
exports.uploadFields = uploadFields;
exports.uploadVisitorFiles = (0, exports.uploadFields)([
    { name: 'entryPhoto', maxCount: 1 },
    { name: 'exitPhoto', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
    { name: 'attachments', maxCount: 3 }
], 'visitors');
exports.uploadProfilePhoto = (0, exports.uploadSingle)('profilePhoto', 'profiles');
exports.uploadDocument = (0, exports.uploadSingle)('document', 'documents');
exports.uploadFile = (0, exports.uploadSingle)('file', 'general');
const setUploadFolder = (folder) => {
    return (req, res, next) => {
        req.uploadFolder = folder;
        next();
    };
};
exports.setUploadFolder = setUploadFolder;
const validateUploadedFiles = (req, res, next) => {
    const files = req.files;
    const file = req.file;
    if (!files && !file) {
        return next();
    }
    if (file) {
        logger_1.logger.info('File uploaded successfully', {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            key: file.key,
            location: file.location
        });
    }
    if (files) {
        if (Array.isArray(files)) {
            files.forEach(f => {
                logger_1.logger.info('File uploaded successfully', {
                    filename: f.originalname,
                    size: f.size,
                    mimetype: f.mimetype,
                    key: f.key,
                    location: f.location
                });
            });
        }
        else {
            Object.keys(files).forEach(fieldName => {
                const fieldFiles = files[fieldName];
                if (Array.isArray(fieldFiles)) {
                    fieldFiles.forEach(f => {
                        logger_1.logger.info('File uploaded successfully', {
                            fieldName,
                            filename: f.originalname,
                            size: f.size,
                            mimetype: f.mimetype,
                            key: f.key,
                            location: f.location
                        });
                    });
                }
            });
        }
    }
    next();
};
exports.validateUploadedFiles = validateUploadedFiles;
exports.default = {
    uploadSingle: exports.uploadSingle,
    uploadMultiple: exports.uploadMultiple,
    uploadFields: exports.uploadFields,
    uploadVisitorFiles: exports.uploadVisitorFiles,
    uploadProfilePhoto: exports.uploadProfilePhoto,
    uploadDocument: exports.uploadDocument,
    uploadFile: exports.uploadFile,
    setUploadFolder: exports.setUploadFolder,
    validateUploadedFiles: exports.validateUploadedFiles
};
//# sourceMappingURL=upload.js.map