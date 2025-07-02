import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VideoLibrary,
  Chat,
  CloudUpload,
  YouTube,
  People,
  Security,
  Speed,
  Integration,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <VideoLibrary fontSize="large" />,
      title: 'Video Collaboration',
      description: 'Share and collaborate on video projects in real-time with other creators.',
    },
    {
      icon: <Chat fontSize="large" />,
      title: 'Real-time Chat',
      description: 'Communicate instantly with your team through our built-in chat system.',
    },
    {
      icon: <CloudUpload fontSize="large" />,
      title: 'File Sharing',
      description: 'Upload and share videos, images, and documents seamlessly.',
    },
    {
      icon: <YouTube fontSize="large" />,
      title: 'YouTube Integration',
      description: 'Direct upload to YouTube with just one click from your projects.',
    },
    {
      icon: <People fontSize="large" />,
      title: 'Role-based Access',
      description: 'Connect with video editors, content creators, and YouTubers.',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure & Private',
      description: 'Your content is protected with enterprise-grade security.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Creators' },
    { number: '50K+', label: 'Projects Created' },
    { number: '1M+', label: 'Files Shared' },
    { number: '99.9%', label: 'Uptime' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Animation */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  mb: 3,
                  background: `linear-gradient(45deg, ${theme.palette.common.white} 30%, ${theme.palette.secondary.light} 90%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create Together, <br />
                Succeed Together
              </Typography>
              
              <Typography
                variant="h5"
                sx={{ 
                  mb: 4, 
                  color: alpha(theme.palette.common.white, 0.9),
                  fontWeight: 300,
                }}
              >
                The ultimate collaboration platform for video editors, content creators, and YouTubers.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.common.white,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: theme.palette.secondary.dark,
                      },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        color: theme.palette.common.white,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: theme.palette.secondary.dark,
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        borderColor: theme.palette.common.white,
                        color: theme.palette.common.white,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: theme.palette.common.white,
                          bgcolor: alpha(theme.palette.common.white, 0.1),
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '400px',
                }}
              >
                {/* Placeholder for hero image/animation */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 4,
                    background: alpha(theme.palette.common.white, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <VideoLibrary sx={{ fontSize: '8rem', opacity: 0.3 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: theme.palette.text.primary,
              }}
            >
              Everything You Need to Collaborate
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Powerful tools designed specifically for creative professionals to work together seamlessly.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: theme.palette.common.white,
              }}
            >
              Ready to Start Creating?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: alpha(theme.palette.common.white, 0.9),
              }}
            >
              Join thousands of creators who are already collaborating and building amazing content together.
            </Typography>
            
            {!user && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.primary.main,
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                  },
                }}
              >
                Join Creator Hub Today
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;