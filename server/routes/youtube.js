const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// YouTube OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/youtube/callback'
);

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

// Get YouTube authorization URL
router.get('/auth', auth, authorize('youtuber', 'content_creator'), (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user._id.toString() // Pass user ID in state
    });

    res.json({
      message: 'YouTube authorization URL generated',
      authUrl
    });
  } catch (error) {
    console.error('YouTube auth error:', error);
    res.status(500).json({
      message: 'Failed to generate authorization URL',
      error: error.message
    });
  }
});

// Handle YouTube OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getAccessToken(code);
    
    // Store tokens in user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store YouTube tokens securely
    user.profile.youtubeTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date
    };

    await user.save();

    res.json({
      message: 'YouTube account connected successfully',
      success: true
    });
  } catch (error) {
    console.error('YouTube callback error:', error);
    res.status(500).json({
      message: 'Failed to connect YouTube account',
      error: error.message
    });
  }
});

// Upload video to YouTube
router.post('/upload', auth, authorize('youtuber', 'content_creator'), async (req, res) => {
  try {
    const {
      filePath,
      title,
      description,
      tags,
      categoryId,
      privacyStatus,
      thumbnail
    } = req.body;

    // Check if user has YouTube tokens
    const user = await User.findById(req.user._id);
    if (!user.profile.youtubeTokens) {
      return res.status(400).json({ 
        message: 'YouTube account not connected. Please authorize first.' 
      });
    }

    // Set up OAuth2 client with user tokens
    oauth2Client.setCredentials({
      access_token: user.profile.youtubeTokens.accessToken,
      refresh_token: user.profile.youtubeTokens.refreshToken
    });

    // Check if file exists
    const videoPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    // Prepare video metadata
    const videoMetadata = {
      snippet: {
        title: title || 'Untitled Video',
        description: description || '',
        tags: tags || [],
        categoryId: categoryId || '22', // Default to People & Blogs
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en'
      },
      status: {
        privacyStatus: privacyStatus || 'private', // private, unlisted, public
        embeddable: true,
        license: 'youtube'
      }
    };

    // Upload video
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoPath)
      }
    });

    const videoId = uploadResponse.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Upload thumbnail if provided
    if (thumbnail && fs.existsSync(path.join(__dirname, '..', thumbnail))) {
      try {
        await youtube.thumbnails.set({
          videoId: videoId,
          media: {
            body: fs.createReadStream(path.join(__dirname, '..', thumbnail))
          }
        });
      } catch (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        // Continue even if thumbnail upload fails
      }
    }

    res.json({
      message: 'Video uploaded to YouTube successfully',
      videoId,
      videoUrl,
      title: uploadResponse.data.snippet.title,
      publishedAt: uploadResponse.data.snippet.publishedAt
    });

  } catch (error) {
    console.error('YouTube upload error:', error);
    
    // Handle token refresh if needed
    if (error.code === 401) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update user tokens
        const user = await User.findById(req.user._id);
        user.profile.youtubeTokens.accessToken = credentials.access_token;
        if (credentials.refresh_token) {
          user.profile.youtubeTokens.refreshToken = credentials.refresh_token;
        }
        user.profile.youtubeTokens.expiryDate = credentials.expiry_date;
        await user.save();

        return res.status(401).json({
          message: 'Token refreshed. Please try uploading again.',
          tokenRefreshed: true
        });
      } catch (refreshError) {
        return res.status(401).json({
          message: 'YouTube authorization expired. Please re-authorize.',
          needsReauth: true
        });
      }
    }

    res.status(500).json({
      message: 'Failed to upload video to YouTube',
      error: error.message
    });
  }
});

// Get user's YouTube channel info
router.get('/channel', auth, authorize('youtuber', 'content_creator'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.profile.youtubeTokens) {
      return res.status(400).json({ 
        message: 'YouTube account not connected' 
      });
    }

    oauth2Client.setCredentials({
      access_token: user.profile.youtubeTokens.accessToken,
      refresh_token: user.profile.youtubeTokens.refreshToken
    });

    const channelResponse = await youtube.channels.list({
      part: ['snippet', 'statistics', 'brandingSettings'],
      mine: true
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return res.status(404).json({ message: 'No YouTube channel found' });
    }

    const channel = channelResponse.data.items[0];

    res.json({
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails?.default?.url,
        subscriberCount: channel.statistics?.subscriberCount,
        videoCount: channel.statistics?.videoCount,
        viewCount: channel.statistics?.viewCount,
        customUrl: channel.snippet.customUrl
      }
    });

  } catch (error) {
    console.error('Get channel error:', error);
    
    if (error.code === 401) {
      return res.status(401).json({
        message: 'YouTube authorization expired. Please re-authorize.',
        needsReauth: true
      });
    }

    res.status(500).json({
      message: 'Failed to get channel info',
      error: error.message
    });
  }
});

// Get user's YouTube videos
router.get('/videos', auth, authorize('youtuber', 'content_creator'), async (req, res) => {
  try {
    const { maxResults = 10, pageToken } = req.query;
    const user = await User.findById(req.user._id);
    
    if (!user.profile.youtubeTokens) {
      return res.status(400).json({ 
        message: 'YouTube account not connected' 
      });
    }

    oauth2Client.setCredentials({
      access_token: user.profile.youtubeTokens.accessToken,
      refresh_token: user.profile.youtubeTokens.refreshToken
    });

    // Get channel ID first
    const channelResponse = await youtube.channels.list({
      part: ['id'],
      mine: true
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return res.status(404).json({ message: 'No YouTube channel found' });
    }

    const channelId = channelResponse.data.items[0].id;

    // Get videos
    const videosResponse = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      type: 'video',
      order: 'date',
      maxResults: parseInt(maxResults),
      pageToken: pageToken
    });

    const videos = videosResponse.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({
      videos,
      nextPageToken: videosResponse.data.nextPageToken,
      totalResults: videosResponse.data.pageInfo?.totalResults
    });

  } catch (error) {
    console.error('Get videos error:', error);
    
    if (error.code === 401) {
      return res.status(401).json({
        message: 'YouTube authorization expired. Please re-authorize.',
        needsReauth: true
      });
    }

    res.status(500).json({
      message: 'Failed to get videos',
      error: error.message
    });
  }
});

// Disconnect YouTube account
router.post('/disconnect', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Remove YouTube tokens
    user.profile.youtubeTokens = undefined;
    await user.save();

    res.json({ message: 'YouTube account disconnected successfully' });
  } catch (error) {
    console.error('Disconnect YouTube error:', error);
    res.status(500).json({
      message: 'Failed to disconnect YouTube account',
      error: error.message
    });
  }
});

// Get upload quota information
router.get('/quota', auth, authorize('youtuber', 'content_creator'), async (req, res) => {
  try {
    // This is a simplified quota check - YouTube API doesn't provide direct quota info
    // In a real implementation, you'd track uploads and implement your own quota management
    
    res.json({
      dailyQuota: {
        uploads: 100, // YouTube allows 100 videos per day by default
        used: 0, // You'd track this in your database
        remaining: 100
      },
      monthlyQuota: {
        uploads: 3000, // Approximate monthly limit
        used: 0,
        remaining: 3000
      },
      note: 'Quota limits are approximate and may vary based on your YouTube account status'
    });
  } catch (error) {
    console.error('Get quota error:', error);
    res.status(500).json({
      message: 'Failed to get quota information',
      error: error.message
    });
  }
});

module.exports = router;