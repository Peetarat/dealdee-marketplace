'''use client';

import React, { useState } from 'react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Container, Box, Paper, Typography, TextField, Button, IconButton, InputAdornment, Divider, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Creating account...");
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.update(toastId, { render: "Account created successfully!", type: "success", isLoading: false, autoClose: 3000 });
            router.push('/'); // Redirect to home after sign up
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        try {
            await signInWithPopup(auth, provider);
            toast.success("Signed in successfully!");
            router.push('/');
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Sign Up</Typography>
                <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'} id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Sign Up"}
                    </Button>
                    <Divider sx={{ my: 2 }}>OR</Divider>
                    <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ mb: 1 }} onClick={() => handleSocialLogin(new GoogleAuthProvider())}>Sign Up with Google</Button>
                    <Button fullWidth variant="outlined" startIcon={<FacebookIcon />} sx={{ backgroundColor: '#1877F2', color: 'white', '&:hover': { backgroundColor: '#166fe5' } }} onClick={() => handleSocialLogin(new FacebookAuthProvider())}>Sign Up with Facebook</Button>
                </Box>
            </Paper>
        </Container>
    );
}
