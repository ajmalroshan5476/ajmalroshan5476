import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add,
  People,
  VideoLibrary,
  Explore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const userRooms = [
    {
      id: 'room1',
      roomId: 'creative-hub',
      name: 'Creative Hub',
      description: 'Main collaboration space for our team',
      members: 5,
      lastActivity: '2 hours ago',
      role: 'admin',
    },
    {
      id: 'room2',
      roomId: 'video-project',
      name: 'Video Project Alpha',
      description: 'Working on the new promotional video',
      members: 3,
      lastActivity: '1 day ago',
      role: 'member',
    },
  ];

  const recentActivity = [
    'John shared a new video file in Creative Hub',
    'Sarah joined Video Project Alpha',
    'Mike uploaded thumbnail designs',
    'New message in Creative Hub from Alex',
  ];

  const getRoleColor = (role) => {
    switch (user?.role) {
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Here's what's happening in your collaboration spaces
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-room')}
            sx={{ bgcolor: getRoleColor() }}
          >
            Create New Room
          </Button>
          <Button
            variant="outlined"
            startIcon={<Explore />}
            onClick={() => navigate('/explore')}
          >
            Explore Rooms
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Your Rooms */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Your Rooms
          </Typography>
          
          {userRooms.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <VideoLibrary sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  No rooms yet
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  Create your first collaboration room to start working with others
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/create-room')}
                >
                  Create Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {userRooms.map((room) => (
                <Grid item xs={12} md={6} key={room.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate(`/room/${room.roomId}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {room.name}
                        </Typography>
                        <Chip
                          label={room.role}
                          size="small"
                          color={room.role === 'admin' ? 'primary' : 'default'}
                        />
                      </Box>
                      
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, mb: 2 }}
                      >
                        {room.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {room.members} members
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {room.lastActivity}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Profile Summary */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Your Profile
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(),
                    mr: 2,
                    width: 56,
                    height: 56,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {user?.role?.replace('_', ' ')}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              {recentActivity.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No recent activity
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentActivity.map((activity, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      • {activity}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;