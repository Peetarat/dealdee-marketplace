'use client';

import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ProfilePage() {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1">
          This is the user profile page. You can edit your profile information here.
        </Typography>
      </Paper>
    </Container>
  );
}
