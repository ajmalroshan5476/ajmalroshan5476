import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ExplorePage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Explore Rooms
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Room discovery and search coming soon...
        </Typography>
      </Box>
    </Container>
  );
};

export default ExplorePage;