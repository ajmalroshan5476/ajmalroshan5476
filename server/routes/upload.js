const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Create subdirectories based on file type
    if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(uploadsDir, 'audio');
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/mp4': true,
    'video/avi': true,
    'video/mov': true,
    'video/wmv': true,
    'video/flv': true,
    'video/webm': true,
    'video/mkv': true,
    'audio/mp3': true,
    'audio/wav': true,
    'audio/aac': true,
    'audio/ogg': true,
    'audio/flac': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'text/plain': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Upload single file
router.post('/single', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { roomId } = req.body;
    
    // If roomId is provided, check if user is member
    if (roomId) {
      const room = await Room.findOne({ roomId });
      if (!room || !room.isMember(req.user._id)) {
        // Delete uploaded file if user doesn't have access
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if file sharing is allowed in room
      if (!room.settings.allowFileSharing) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'File sharing is not allowed in this room' });
      }
    }

    // Get file type category
    let fileType = 'document';
    if (req.file.mimetype.startsWith('image/')) fileType = 'image';
    else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
    else if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';

    // Build file URL
    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: fileType,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      isPublic: req.body.isPublic === 'true'
    };

    // If uploading to a room, add to room files and create message
    if (roomId) {
      const room = await Room.findOne({ roomId });
      room.files.push(fileData);
      await room.save();

      // Create file message
      const message = new Message({
        roomId: room._id,
        sender: req.user._id,
        content: {
          file: fileData
        },
        messageType: fileType
      });
      await message.save();
    }

    res.json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Upload multiple files
router.post('/multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { roomId } = req.body;
    const uploadedFiles = [];

    // If roomId is provided, check permissions
    let room = null;
    if (roomId) {
      room = await Room.findOne({ roomId });
      if (!room || !room.isMember(req.user._id)) {
        // Delete all uploaded files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(403).json({ message: 'Access denied' });
      }

      if (!room.settings.allowFileSharing) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(403).json({ message: 'File sharing is not allowed in this room' });
      }
    }

    // Process each uploaded file
    for (const file of req.files) {
      let fileType = 'document';
      if (file.mimetype.startsWith('image/')) fileType = 'image';
      else if (file.mimetype.startsWith('video/')) fileType = 'video';
      else if (file.mimetype.startsWith('audio/')) fileType = 'audio';

      const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;

      const fileData = {
        filename: file.filename,
        originalName: file.originalname,
        fileUrl: fileUrl,
        fileType: fileType,
        fileSize: file.size,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
        isPublic: req.body.isPublic === 'true'
      };

      uploadedFiles.push(fileData);

      // Add to room if specified
      if (room) {
        room.files.push(fileData);

        // Create file message for each file
        const message = new Message({
          roomId: room._id,
          sender: req.user._id,
          content: {
            file: fileData
          },
          messageType: fileType
        });
        await message.save();
      }
    }

    // Save room with new files
    if (room) {
      await room.save();
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Get room files
router.get('/room/:roomId/files', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('files.uploadedBy', 'username profile.firstName profile.lastName profile.avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id) && room.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filter files based on user permissions
    let files = room.files;
    if (!room.isMember(req.user._id)) {
      files = room.files.filter(file => file.isPublic);
    }

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      message: 'Failed to get files',
      error: error.message
    });
  }
});

// Delete file
router.delete('/file/:roomId/:filename', auth, async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const file = room.files.find(f => f.filename === filename);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user has permission to delete
    const memberRole = room.getMemberRole(req.user._id);
    if (file.uploadedBy.toString() !== req.user._id.toString() && 
        memberRole !== 'admin' && memberRole !== 'moderator') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Remove file from filesystem
    const filePath = path.join(__dirname, '..', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file from room
    room.files = room.files.filter(f => f.filename !== filename);
    await room.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name' });
    }
  }
  
  if (error.message === 'File type not allowed') {
    return res.status(400).json({ message: 'File type not allowed' });
  }

  res.status(500).json({ message: 'Upload failed', error: error.message });
});

module.exports = router;