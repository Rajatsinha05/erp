import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@/config/environment';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size?: number;
  contentType?: string;
}

export interface PresignedUrlOptions {
  expiresIn?: number;
  contentType?: string;
  contentLength?: number;
}

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    // Configure for Contabo S3-compatible storage
    this.s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.CONTABO_S3_ENDPOINT || 'https://eu2.contabostorage.com', // Contabo endpoint
      forcePathStyle: true, // Required for Contabo
    });

    this.bucket = config.AWS_S3_BUCKET;

    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }
  }

  /**
   * Generate a unique file key
   */
  private generateFileKey(originalName: string, folder?: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    
    const fileName = `${name}-${timestamp}-${uuid}${ext}`;
    
    if (folder) {
      return `${folder}/${fileName}`;
    }
    
    return fileName;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Buffer | Uint8Array | string,
    originalName: string,
    contentType: string,
    folder?: string
  ): Promise<UploadResult> {
    try {
      const key = this.generateFileKey(originalName, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'private', // Private by default
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;

      logger.info('File uploaded successfully', {
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
    } catch (error) {
      logger.error('Error uploading file to S3', { error, originalName, folder });
      throw new AppError('Failed to upload file', 500);
    }
  }

  /**
   * Get presigned URL for upload
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder?: string,
    options: PresignedUrlOptions = {}
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const key = this.generateFileKey(fileName, folder);
      const { expiresIn = 3600, contentLength } = options; // 1 hour default

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
        ACL: 'private',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      logger.info('Generated presigned upload URL', {
        key,
        expiresIn,
        contentType
      });

      return {
        uploadUrl,
        key
      };
    } catch (error) {
      logger.error('Error generating presigned upload URL', { error, fileName, folder });
      throw new AppError('Failed to generate upload URL', 500);
    }
  }

  /**
   * Get presigned URL for download
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      logger.info('Generated presigned download URL', {
        key,
        expiresIn
      });

      return downloadUrl;
    } catch (error) {
      logger.error('Error generating presigned download URL', { error, key });
      throw new AppError('Failed to generate download URL', 500);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      
      logger.info('File deleted successfully', { key, bucket: this.bucket });
    } catch (error) {
      logger.error('Error deleting file from S3', { error, key });
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      logger.error('Error checking file existence', { error, key });
      throw new AppError('Failed to check file existence', 500);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
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
    } catch (error) {
      logger.error('Error getting file metadata', { error, key });
      throw new AppError('Failed to get file metadata', 500);
    }
  }

  /**
   * Extract key from S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      // Handle different S3 URL formats
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
    } catch (error) {
      logger.error('Error extracting key from URL', { error, url });
      return null;
    }
  }
}

export default new S3Service();
