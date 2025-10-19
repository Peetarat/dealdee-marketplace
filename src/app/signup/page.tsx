'use client';

import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Container, Box, Paper, Typography, TextField, Button, IconButton, InputAdornment, Divider, CircularProgress, Link } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../components/LanguageProvider';

export default function SignUpPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(t('Toast.creatingAccount'));
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.update(toastId, { render: t('Toast.createSuccess'), type: "success", isLoading: false, autoClose: 3000 });
            router.push('/products'); // Redirect to products after sign up
        } catch (error: any) {
            toast.update(toastId, { render: `${t('Toast.errorPrefix')}: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignIn = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        try {
            await signInWithPopup(auth, provider);
            toast.success(t('Toast.signInSuccess'));
            router.push('/products');
        } catch (error: any) {
            toast.error(`${t('Toast.errorPrefix')}: ${error.message}`);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '16px' }}>
                <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
                <Typography component="h1" variant="h5" fontWeight="bold" color="primary">
                    DealDee
                </Typography>
                <Typography component="h2" variant="subtitle1" sx={{ mt: 2, textAlign: 'center' }}>
                    {t('SignUp.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    {t('Login.subtitle')}
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={() => handleSocialSignIn(new GoogleAuthProvider())}>
                        {t('Login.googleButton')}
                    </Button>
                    <Button fullWidth variant="contained" startIcon={<FacebookIcon />} sx={{ bgcolor: '#1877F2', color: 'white', '&:hover': { bgcolor: '#166fe5' } }} onClick={() => handleSocialSignIn(new FacebookAuthProvider())}>
                        {t('Login.facebookButton')}
                    </Button>
                </Box>

                <Divider sx={{ my: 2, width: '100%' }}>{t('Login.orDivider')}</Divider>

                <Box component="form" onSubmit={handleSignUp} noValidate sx={{ width: '100%' }}>
                    <TextField margin="dense" required fullWidth id="email" label={t('Login.emailLabel')} name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin="dense" required fullWidth name="password" label={t('Login.passwordLabel')} type={showPassword ? 'text' : 'password'} id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label={t('Login.togglePasswordVisibility')} sx={{ color: 'text.secondary' }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, borderRadius: '20px' }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : t('SignUp.submitButton')}
                    </Button>
                    <Link href="/login" variant="body2" sx={{ display: 'block', textAlign: 'center' }}>
                        {t('SignUp.loginLink')}
                    </Link>
                </Box>
                 <Typography variant="caption" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                    {t('Login.termsPrefix')}
                    <Link href="#">{t('Login.termsOfService')}</Link>
                    {t('Login.termsAnd')}
                    <Link href="#">{t('Login.privacyPolicy')}</Link>
                    {t('Login.termsSuffix')}
                </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                {t('Footer.copyright').replace('{year}', new Date().getFullYear().toString())}
            </Typography>
        </Container>
    );
}
