import React, { useState } from 'react';
  import { auth } from './firebaseConfig';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CssBaseline,
  } from '@mui/material';

  function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
      e.preventDefault();
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Login successful, App.js will handle the redirect to the dashboard
      } catch (error) {
        setError("Invalid email or password."); // More user-friendly error
        console.error("Error logging in:", error);
      }
    };

    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Admin Panel Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  export default Login;