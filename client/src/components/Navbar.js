import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Box,
  useTheme,
} from '@mui/material';
import {
  VideoLibrary,
  Notifications,
  Settings,
  Logout,
  Dashboard,
  PersonAdd,
  Explore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'video_editor':
        return theme.palette.primary.main;
      case 'content_creator':
        return theme.palette.secondary.main;
      case 'youtuber':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'video_editor':
        return 'Video Editor';
      case 'content_creator':
        return 'Content Creator';
      case 'youtuber':
        return 'YouTuber';
      default:
        return role;
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <VideoLibrary fontSize="large" />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
          }}
          onClick={() => navigate('/')}
        >
          Creator Hub
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Navigation Buttons */}
            <Button 
              color="inherit" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<Explore />}
              onClick={() => navigate('/explore')}
            >
              Explore
            </Button>

            <Button 
              color="inherit" 
              startIcon={<PersonAdd />}
              onClick={() => navigate('/create-room')}
            >
              Create Room
            </Button>

            {/* Notifications */}
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.username}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: getRoleColor(user.role),
                    fontWeight: 500,
                  }}
                >
                  {getRoleLabel(user.role)}
                </Typography>
              </Box>
              
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  alt={user.username}
                  src={user.profile?.avatar}
                  sx={{ 
                    bgcolor: getRoleColor(user.role),
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <MenuItem 
                onClick={() => {
                  navigate('/profile');
                  handleUserMenuClose();
                }}
              >
                <Settings sx={{ mr: 2 }} />
                Profile Settings
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                }
              }}
              onClick={() => navigate('/register')}
            >
              Join Now
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;