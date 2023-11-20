// TrustKey Compression Middleware

const compression = require('compression');

const compressionOptions = {
  // Compression level (1-9, where 9 is maximum compression)
  level: 6,
  
  // Minimum response size to compress (in bytes)
  threshold: 1024,
  
  // Filter function to determine if response should be compressed
  filter: (req, res) => {
    // Don't compress if request explicitly asks for no compression
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all other responses
    return compression.filter(req, res);
  },
  
  // Compression algorithm
  strategy: compression.constants.Z_DEFAULT_STRATEGY,
  
  // Memory level for compression (1-9)
  memLevel: 8,
  
  // Window bits for compression
  windowBits: 15,
  
  // Chunk size for compression
  chunkSize: 16 * 1024,
};

module.exports = compression(compressionOptions);
