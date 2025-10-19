'use client';

import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Container, Box, Paper, Typography, TextField, Button, CircularProgress, Link } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../components/LanguageProvider';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(t('Toast.sendingResetEmail'));
        try {
            await sendPasswordResetEmail(auth, email);
            toast.update(toastId, { 
                render: t('Toast.resetEmailSent'), 
                type: 'success', 
                isLoading: false, 
                autoClose: 5000 
            });
            // Optionally redirect or just show a success message
            // router.push('/login');
        } catch (error: any) {
            toast.update(toastId, { 
                render: `${t('Toast.errorPrefix')}: ${error.message}`, 
                type: 'error', 
                isLoading: false, 
                autoClose: 5000 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '16px' }}>
                <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
                <Typography component="h1" variant="h5" fontWeight="bold">
                    {t('ForgotPassword.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
                    {t('ForgotPassword.instructions')}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField 
                        margin="normal" 
                        required 
                        fullWidth 
                        id="email" 
                        label={t('Login.emailLabel')} 
                        name="email" 
                        autoComplete="email" 
                        autoFocus 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <Button 
                        type="submit" 
                        fullWidth 
                        variant="contained" 
                        size="large" 
                        sx={{ mt: 3, mb: 2, borderRadius: '20px' }} 
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : t('ForgotPassword.submitButton')}
                    </Button>
                    <Link href="/login" variant="body2" sx={{ display: 'block', textAlign: 'center' }}>
                        {t('ForgotPassword.backToLogin')}
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
}
