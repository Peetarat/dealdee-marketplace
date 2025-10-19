'use client';

import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function CartPage() {
    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
                    My Shopping Cart
                </Typography>
                <Typography color="text.secondary">
                    This page is under construction. Your shopping cart items will appear here.
                </Typography>
            </Paper>
        </Container>
    );
}
