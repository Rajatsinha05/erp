"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const environment_1 = __importDefault(require("@/config/environment"));
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
class S3Service {
    s3Client;
    bucket;
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: environment_1.default.AWS_REGION,
            credentials: {
                accessKeyId: environment_1.default.AWS_ACCESS_KEY_ID,
                secretAccessKey: environment_1.default.AWS_SECRET_ACCESS_KEY,
            },
            endpoint: process.env.CONTABO_S3_ENDPOINT || 'https://eu2.contabostorage.com',
            forcePathStyle: true,
        });
        this.bucket = environment_1.default.AWS_S3_BUCKET;
        if (!this.bucket) {
            throw new Error('S3 bucket name is required');
        }
    }
    generateFileKey(originalName, folder) {
        const ext = path_1.default.extname(originalName);
        const name = path_1.default.basename(originalName, ext);
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)().substring(0, 8);
        const fileName = `${name}-${timestamp}-${uuid}${ext}`;
        if (folder) {
            return `${folder}/${fileName}`;
        }
        return fileName;
    }
    async uploadFile(file, originalName, contentType, folder) {
        try {
            const key = this.generateFileKey(originalName, folder);
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file,
                ContentType: contentType,
                ACL: 'private',
            });
            await this.s3Client.send(command);
            const url = `https://${this.bucket}.s3.${environment_1.default.AWS_REGION}.amazonaws.com/${key}`;
            logger_1.logger.info('File uploaded successfully', {
                key,
                bucket: this.bucket,
                url
            });
            return {
                key,
                url,
                bucket: this.bucket,
                contentType
            };
        }
        catch (error) {
            logger_1.logger.error('Error uploading file to S3', { error, originalName, folder });
            throw new errors_1.AppError('Failed to upload file', 500);
        }
    }
    async getPresignedUploadUrl(fileName, contentType, folder, options = {}) {
        try {
            const key = this.generateFileKey(fileName, folder);
            const { expiresIn = 3600, contentLength } = options;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: contentType,
                ContentLength: contentLength,
                ACL: 'private',
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            logger_1.logger.info('Generated presigned upload URL', {
                key,
                expiresIn,
                contentType
            });
            return {
                uploadUrl,
                key
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating presigned upload URL', { error, fileName, folder });
            throw new errors_1.AppError('Failed to generate upload URL', 500);
        }
    }
    async getPresignedDownloadUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            logger_1.logger.info('Generated presigned download URL', {
                key,
                expiresIn
            });
            return downloadUrl;
        }
        catch (error) {
            logger_1.logger.error('Error generating presigned download URL', { error, key });
            throw new errors_1.AppError('Failed to generate download URL', 500);
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            logger_1.logger.info('File deleted successfully', { key, bucket: this.bucket });
        }
        catch (error) {
            logger_1.logger.error('Error deleting file from S3', { error, key });
            throw new errors_1.AppError('Failed to delete file', 500);
        }
    }
    async fileExists(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            logger_1.logger.error('Error checking file existence', { error, key });
            throw new errors_1.AppError('Failed to check file existence', 500);
        }
    }
    async getFileMetadata(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const result = await this.s3Client.send(command);
            return {
                contentType: result.ContentType,
                contentLength: result.ContentLength,
                lastModified: result.LastModified,
                etag: result.ETag,
                metadata: result.Metadata
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting file metadata', { error, key });
            throw new errors_1.AppError('Failed to get file metadata', 500);
        }
    }
    extractKeyFromUrl(url) {
        try {
            const patterns = [
                new RegExp(`https://${this.bucket}\\.s3\\.[^/]+/(.+)`),
                new RegExp(`https://s3\\.[^/]+/${this.bucket}/(.+)`),
                new RegExp(`https://[^/]+/${this.bucket}/(.+)`)
            ];
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return decodeURIComponent(match[1]);
                }
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Error extracting key from URL', { error, url });
            return null;
        }
    }
}
exports.S3Service = S3Service;
exports.default = new S3Service();
//# sourceMappingURL=S3Service.js.map