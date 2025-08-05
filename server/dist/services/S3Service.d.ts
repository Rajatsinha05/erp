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
export declare class S3Service {
    private s3Client;
    private bucket;
    constructor();
    private generateFileKey;
    uploadFile(file: Buffer | Uint8Array | string, originalName: string, contentType: string, folder?: string): Promise<UploadResult>;
    getPresignedUploadUrl(fileName: string, contentType: string, folder?: string, options?: PresignedUrlOptions): Promise<{
        uploadUrl: string;
        key: string;
    }>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    fileExists(key: string): Promise<boolean>;
    getFileMetadata(key: string): Promise<{
        contentType: string;
        contentLength: number;
        lastModified: Date;
        etag: string;
        metadata: Record<string, string>;
    }>;
    extractKeyFromUrl(url: string): string | null;
}
declare const _default: S3Service;
export default _default;
//# sourceMappingURL=S3Service.d.ts.map