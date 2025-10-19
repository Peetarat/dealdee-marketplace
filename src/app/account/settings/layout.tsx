'use client';

import React from 'react';
import { Container, Paper, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import { usePathname, useRouter } from 'next/navigation';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { text: 'Profile', path: '/account/settings', icon: <AccountCircleIcon /> },
        { text: 'Payment Methods', path: '/account/settings/payment', icon: <PaymentsIcon /> },
        // Add future settings pages here (e.g., Membership, Security)
    ];

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={2} sx={{ p: 1 }}>
                        <List>
                            {menuItems.map((item) => (
                                <ListItem key={item.text} disablePadding>
                                    <ListItemButton 
                                        selected={pathname === item.path}
                                        onClick={() => router.push(item.path)}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        {children}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
