'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

// This page is just a placeholder. 
// The actual redirection logic is handled in AppLayout.tsx as a workaround
// for a persistent module resolution bug.
export default function MyProfileRedirectPlaceholder() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Loading Profile...</Typography>
    </Box>
  );
}