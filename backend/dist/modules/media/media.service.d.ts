export declare class MediaService {
    /** Sanitizes the requested folder and resolves it against the upload root,
     * rejecting anything that would escape it (no `..`, no slashes, no
     * absolute paths). */
    private resolveUploadDir;
    uploadFiles(files: Express.Multer.File[], requestedFolder: string): Promise<string[]>;
}
//# sourceMappingURL=media.service.d.ts.map