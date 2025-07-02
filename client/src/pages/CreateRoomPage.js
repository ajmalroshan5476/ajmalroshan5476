import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const CreateRoomPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Create New Room
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Room creation form coming soon...
        </Typography>
      </Box>
    </Container>
  );
};

export default CreateRoomPage;