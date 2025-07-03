const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get messages for a room
router.get('/room/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is member or if room is public
    if (!room.isMember(req.user._id) && room.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ 
      roomId: room._id, 
      isDeleted: false 
    })
    .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
    .populate('replyTo', 'content sender createdAt')
    .populate('mentions.user', 'username profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Mark messages as read for current user
    const unreadMessages = messages.filter(msg => 
      !msg.readBy.some(r => r.user.toString() === req.user._id.toString())
    );

    for (const message of unreadMessages) {
      await message.markAsRead(req.user._id);
    }

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(await Message.countDocuments({ roomId: room._id, isDeleted: false }) / parseInt(limit)),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Send a new message
router.post('/send', auth, async (req, res) => {
  try {
    const { roomId, content, messageType = 'text', replyTo, mentions } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    const message = new Message({
      roomId: room._id,
      sender: req.user._id,
      content: { text: content },
      messageType,
      replyTo,
      mentions: mentions || []
    });

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'username profile.firstName profile.lastName profile.avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content sender createdAt');
    }

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Edit a message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit deleted message' });
    }

    await message.editMessage(content);

    res.json({
      message: 'Message updated successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      message: 'Failed to edit message',
      error: error.message
    });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can delete (own message or admin/moderator)
    const room = await Room.findById(message.roomId);
    const memberRole = room.getMemberRole(req.user._id);
    
    if (message.sender.toString() !== req.user._id.toString() && 
        memberRole !== 'admin' && memberRole !== 'moderator') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await message.deleteMessage();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is member of the room
    const room = await Room.findById(message.roomId);
    if (!room.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    await message.addReaction(req.user._id, emoji);

    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      message: 'Failed to add reaction',
      error: error.message
    });
  }
});

// Remove reaction from message
router.delete('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user._id, emoji);

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      message: 'Failed to remove reaction',
      error: error.message
    });
  }
});

// Search messages in a room
router.get('/search/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query, messageType, sender, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id) && room.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let searchQuery = { roomId: room._id, isDeleted: false };

    if (query) {
      searchQuery['content.text'] = { $regex: query, $options: 'i' };
    }

    if (messageType) {
      searchQuery.messageType = messageType;
    }

    if (sender) {
      searchQuery.sender = sender;
    }

    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find(searchQuery)
      .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalResults = await Message.countDocuments(searchQuery);

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit)),
        totalResults,
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      message: 'Failed to search messages',
      error: error.message
    });
  }
});

// Get unread message count for user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userRooms = await Room.find({ 'members.user': req.user._id });
    const roomIds = userRooms.map(room => room._id);

    const unreadCount = await Message.countDocuments({
      roomId: { $in: roomIds },
      isDeleted: false,
      'readBy.user': { $ne: req.user._id },
      sender: { $ne: req.user._id } // Don't count own messages
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// Mark all messages in room as read
router.post('/mark-read/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    const unreadMessages = await Message.find({
      roomId: room._id,
      isDeleted: false,
      'readBy.user': { $ne: req.user._id }
    });

    for (const message of unreadMessages) {
      await message.markAsRead(req.user._id);
    }

    res.json({ 
      message: 'Messages marked as read',
      markedCount: unreadMessages.length
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

module.exports = router;