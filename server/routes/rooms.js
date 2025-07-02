const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new room
router.post('/create', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      isPrivate,
      allowFileSharing,
      maxMembers,
      allowedRoles,
      projectName,
      deadline,
      tags,
      priority
    } = req.body;

    const roomId = uuidv4().substr(0, 8); // Generate unique room ID

    const room = new Room({
      name,
      description,
      roomId,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }],
      settings: {
        isPrivate: isPrivate || false,
        allowFileSharing: allowFileSharing !== false,
        maxMembers: maxMembers || 50,
        allowedRoles: allowedRoles || ['video_editor', 'content_creator', 'youtuber']
      },
      project: {
        name: projectName,
        deadline,
        tags: tags || [],
        priority: priority || 'medium'
      }
    });

    await room.save();

    // Add room to user's rooms list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id }
    });

    // Send system message
    const systemMessage = new Message({
      roomId: room._id,
      sender: req.user._id,
      content: { text: `${req.user.username} created the room` },
      messageType: 'system'
    });
    await systemMessage.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar role');

    res.status(201).json({
      message: 'Room created successfully',
      room: populatedRoom
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      message: 'Failed to create room',
      error: error.message
    });
  }
});

// Get user's rooms
router.get('/my-rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      'members.user': req.user._id,
      isActive: true
    })
    .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
    .populate('members.user', 'username profile.firstName profile.lastName profile.avatar role')
    .sort({ lastActivity: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      message: 'Failed to get rooms',
      error: error.message
    });
  }
});

// Get room by ID
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar role');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is member or if room is public
    if (!room.isMember(req.user._id) && room.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      message: 'Failed to get room',
      error: error.message
    });
  }
});

// Join room
router.post('/:roomId/join', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if already a member
    if (room.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    // Check room limits
    if (room.members.length >= room.settings.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Check if user role is allowed
    if (room.settings.allowedRoles.length > 0 && 
        !room.settings.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Your role is not allowed in this room' });
    }

    // Add member to room
    await room.addMember(req.user._id);

    // Add room to user's rooms list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id }
    });

    // Send system message
    const systemMessage = new Message({
      roomId: room._id,
      sender: req.user._id,
      content: { text: `${req.user.username} joined the room` },
      messageType: 'system'
    });
    await systemMessage.save();

    res.json({ message: 'Successfully joined room' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      message: 'Failed to join room',
      error: error.message
    });
  }
});

// Leave room
router.post('/:roomId/leave', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.isMember(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this room' });
    }

    // Remove member from room
    await room.removeMember(req.user._id);

    // Remove room from user's rooms list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { rooms: room._id }
    });

    // Send system message
    const systemMessage = new Message({
      roomId: room._id,
      sender: req.user._id,
      content: { text: `${req.user.username} left the room` },
      messageType: 'system'
    });
    await systemMessage.save();

    res.json({ message: 'Successfully left room' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      message: 'Failed to leave room',
      error: error.message
    });
  }
});

// Update room settings
router.put('/:roomId/settings', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is admin
    const memberRole = room.getMemberRole(req.user._id);
    if (memberRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update room settings' });
    }

    const {
      name,
      description,
      isPrivate,
      allowFileSharing,
      maxMembers,
      allowedRoles,
      projectName,
      deadline,
      tags,
      priority
    } = req.body;

    // Update room fields
    if (name !== undefined) room.name = name;
    if (description !== undefined) room.description = description;
    if (isPrivate !== undefined) room.settings.isPrivate = isPrivate;
    if (allowFileSharing !== undefined) room.settings.allowFileSharing = allowFileSharing;
    if (maxMembers !== undefined) room.settings.maxMembers = maxMembers;
    if (allowedRoles !== undefined) room.settings.allowedRoles = allowedRoles;
    if (projectName !== undefined) room.project.name = projectName;
    if (deadline !== undefined) room.project.deadline = deadline;
    if (tags !== undefined) room.project.tags = tags;
    if (priority !== undefined) room.project.priority = priority;

    await room.save();

    res.json({
      message: 'Room settings updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      message: 'Failed to update room settings',
      error: error.message
    });
  }
});

// Search public rooms
router.get('/search/public', auth, async (req, res) => {
  try {
    const { search, role, tag } = req.query;
    let query = { 'settings.isPrivate': false, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'project.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query['settings.allowedRoles'] = { $in: [role] };
    }

    if (tag) {
      query['project.tags'] = { $in: [tag] };
    }

    const rooms = await Room.find(query)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .select('name description roomId creator members settings project createdAt')
      .sort({ lastActivity: -1 })
      .limit(20);

    res.json({ rooms });
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({
      message: 'Failed to search rooms',
      error: error.message
    });
  }
});

// Update member role
router.put('/:roomId/members/:userId/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is admin
    const currentUserRole = room.getMemberRole(req.user._id);
    if (currentUserRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }

    // Find and update member
    const member = room.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await room.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      message: 'Failed to update member role',
      error: error.message
    });
  }
});

module.exports = router;