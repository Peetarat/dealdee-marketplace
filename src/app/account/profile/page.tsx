''''use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AccountProfileRedirect() {
  const [user, loading] = useAuth(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

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
      <Typography sx={{ mt: 2 }}>Redirecting to your profile...</Typography>
    </Box>
  );
}
''''