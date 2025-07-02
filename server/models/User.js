const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['video_editor', 'content_creator', 'youtuber'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    specialties: [String], // e.g., ['motion graphics', 'color grading', 'audio editing']
    experience: String, // e.g., 'beginner', 'intermediate', 'advanced', 'professional'
    portfolio: String, // URL to portfolio
    youtubeChannel: String, // YouTube channel URL for youtubers
    socialMedia: {
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
      allowDirectMessages: { type: Boolean, default: true }
    }
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);