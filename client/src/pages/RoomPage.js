import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const RoomPage = () => {
  const { roomId } = useParams();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Room: {roomId}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Chat interface and file sharing coming soon...
        </Typography>
      </Box>
    </Container>
  );
};

export default RoomPage;