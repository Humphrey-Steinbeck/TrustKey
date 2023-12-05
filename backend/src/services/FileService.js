// TrustKey File Service

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('../utils/logger');

class FileService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'text/plain', 'application/msword'],
      archives: ['application/zip', 'application/x-rar-compressed'],
    };
    
    this.initializeUploadDirectory();
  }

  /**
   * Initialize upload directory
   */
  async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'archives'), { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'temp'), { recursive: true });
      
      logger.info('Upload directories initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize upload directories:', error);
    }
  }

  /**
   * Configure multer storage
   */
  getStorageConfig() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = this.getUploadDirectory(file.mimetype);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      },
    });
  }

  /**
   * Get upload directory based on file type
   */
  getUploadDirectory(mimetype) {
    if (this.allowedTypes.images.includes(mimetype)) {
      return path.join(this.uploadPath, 'images');
    } else if (this.allowedTypes.documents.includes(mimetype)) {
      return path.join(this.uploadPath, 'documents');
    } else if (this.allowedTypes.archives.includes(mimetype)) {
      return path.join(this.uploadPath, 'archives');
    } else {
      return path.join(this.uploadPath, 'temp');
    }
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    
    return `${name}_${timestamp}_${random}${ext}`;
  }

  /**
   * File filter function
   */
  fileFilter(req, file, cb) {
    const allowedMimes = [
      ...this.allowedTypes.images,
      ...this.allowedTypes.documents,
      ...this.allowedTypes.archives,
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }

  /**
   * Get multer configuration
   */
  getMulterConfig() {
    return {
      storage: this.getStorageConfig(),
      limits: {
        fileSize: this.maxFileSize,
        files: 5, // Maximum 5 files per request
      },
      fileFilter: this.fileFilter.bind(this),
    };
  }

  /**
   * Upload single file
   */
  uploadSingle(fieldName) {
    const upload = multer(this.getMulterConfig());
    return upload.single(fieldName);
  }

  /**
   * Upload multiple files
   */
  uploadMultiple(fieldName, maxCount = 5) {
    const upload = multer(this.getMulterConfig());
    return upload.array(fieldName, maxCount);
  }

  /**
   * Upload multiple fields
   */
  uploadFields(fields) {
    const upload = multer(this.getMulterConfig());
    return upload.fields(fields);
  }

  /**
   * Save file to specific location
   */
  async saveFile(buffer, filename, directory = 'temp') {
    try {
      const uploadDir = path.join(this.uploadPath, directory);
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      
      logger.info('File saved successfully:', { filePath, size: buffer.length });
      return {
        success: true,
        filePath,
        filename,
        size: buffer.length,
      };
    } catch (error) {
      logger.error('Failed to save file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Read file from path
   */
  async readFile(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        buffer,
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch (error) {
      logger.error('Failed to read file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info('File deleted successfully:', { filePath });
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);
      const basename = path.basename(filePath, ext);
      
      return {
        success: true,
        info: {
          filename: path.basename(filePath),
          basename,
          extension: ext,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
        },
      };
    } catch (error) {
      logger.error('Failed to get file info:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Move file to different location
   */
  async moveFile(sourcePath, destinationPath) {
    try {
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.rename(sourcePath, destinationPath);
      
      logger.info('File moved successfully:', { sourcePath, destinationPath });
      return { success: true };
    } catch (error) {
      logger.error('Failed to move file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Copy file to different location
   */
  async copyFile(sourcePath, destinationPath) {
    try {
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.copyFile(sourcePath, destinationPath);
      
      logger.info('File copied successfully:', { sourcePath, destinationPath });
      return { success: true };
    } catch (error) {
      logger.error('Failed to copy file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List files in directory
   */
  async listFiles(directory = '', recursive = false) {
    try {
      const dirPath = directory ? path.join(this.uploadPath, directory) : this.uploadPath;
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      
      const result = [];
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        const stats = await fs.stat(filePath);
        
        result.push({
          name: file.name,
          path: filePath,
          isDirectory: file.isDirectory(),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        });

        if (recursive && file.isDirectory()) {
          const subFiles = await this.listFiles(
            path.relative(this.uploadPath, filePath),
            true
          );
          result.push(...subFiles);
        }
      }
      
      return {
        success: true,
        files: result,
      };
    } catch (error) {
      logger.error('Failed to list files:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file hash
   */
  async getFileHash(filePath, algorithm = 'sha256') {
    try {
      const buffer = await fs.readFile(filePath);
      const hash = crypto.createHash(algorithm);
      hash.update(buffer);
      
      return {
        success: true,
        hash: hash.digest('hex'),
        algorithm,
      };
    } catch (error) {
      logger.error('Failed to calculate file hash:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate file type
   */
  validateFileType(mimetype) {
    const allAllowedTypes = [
      ...this.allowedTypes.images,
      ...this.allowedTypes.documents,
      ...this.allowedTypes.archives,
    ];
    
    return allAllowedTypes.includes(mimetype);
  }

  /**
   * Get file type category
   */
  getFileTypeCategory(mimetype) {
    if (this.allowedTypes.images.includes(mimetype)) {
      return 'image';
    } else if (this.allowedTypes.documents.includes(mimetype)) {
      return 'document';
    } else if (this.allowedTypes.archives.includes(mimetype)) {
      return 'archive';
    } else {
      return 'unknown';
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const tempDir = path.join(this.uploadPath, 'temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }

      logger.info('Temporary files cleaned up:', { cleanedCount });
      return { success: true, cleanedCount };
    } catch (error) {
      logger.error('Failed to cleanup temporary files:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const stats = {
        totalSize: 0,
        fileCount: 0,
        byType: {
          images: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          archives: { count: 0, size: 0 },
          temp: { count: 0, size: 0 },
        },
      };

      const result = await this.listFiles('', true);
      if (result.success) {
        for (const file of result.files) {
          if (file.isFile) {
            stats.totalSize += file.size;
            stats.fileCount++;
            
            const category = this.getFileTypeCategory(file.mimetype || 'unknown');
            if (stats.byType[category]) {
              stats.byType[category].count++;
              stats.byType[category].size += file.size;
            }
          }
        }
      }

      return { success: true, stats };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new FileService();
