'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useLanguage } from './LanguageProvider';
import { useAppTheme } from './AppThemeProvider';
import LanguageSwitcher from './LanguageSwitcher';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Paper, BottomNavigation, 
    BottomNavigationAction, Avatar, Badge, Button, Menu, MenuItem, Divider, useMediaQuery, useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// ... (UserAvatar component)

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const { toggleColorMode } = useAppTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [sellerMenuAnchorEl, setSellerMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0); // Placeholder for chat

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSellerMenuAnchorEl(null);
    };

    const handleSellerMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSellerMenuAnchorEl(event.currentTarget);
    };

    const handleSellerMenuClose = () => {
        setSellerMenuAnchorEl(null);
    };

    const handleLogout = () => {
        auth.signOut();
        handleMenuClose();
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data());
                }

                const notifQuery = query(
                    collection(db, "notifications"),
                    where("userId", "==", currentUser.uid),
                    where("isRead", "==", false)
                );
                const unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
                    setUnreadNotifCount(snapshot.size);
                });
                
                // TODO: Add real-time listener for unread messages

                return () => unsubscribeNotifs();
            } else {
                setUserProfile(null);
                setUnreadNotifCount(0);
                setUnreadMsgCount(0);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const bottomNavValue = () => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/chat')) return 'chat';
        if (pathname.startsWith('/account/products/add')) return 'sell';
        if (pathname.startsWith('/notifications')) return 'notifications';
        if (pathname.startsWith('/account')) return 'account';
        return '';
    };

    return (
        <Box sx={{ display: 'flex', pb: isMobile ? '56px' : 0 }}> {/* Add padding-bottom for mobile nav */}
            <AppBar 
                position="fixed" 
                elevation={0}
                sx={(theme) => ({
                    zIndex: theme.zIndex.drawer + 1,
                    backgroundColor: theme.palette.mode === 'dark' 
                        ? '#000'
                        : theme.palette.background.paper,
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                })}
            >
                <Toolbar>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
                        <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            DealDee
                        </Typography>
                    </Box>
                    
                    {!isMobile && (
                        <>
                            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                            <LanguageSwitcher /> 
                        </>
                    )}
                    
                    {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!isMobile && (
                                <>
                                    <IconButton onClick={() => router.push('/chat')} color="inherit">
                                        <Badge badgeContent={unreadMsgCount} color="error">
                                            <ChatIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton onClick={() => router.push('/notifications')} color="inherit">
                                        <Badge badgeContent={unreadNotifCount} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton onClick={handleAvatarClick}>
                                        {userProfile?.photoURL ? (
                                            <Avatar src={userProfile.photoURL} alt={userProfile.displayName} />
                                        ) : (
                                            <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                                {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : ''}
                                            </Avatar>
                                        )}
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    >
                                        <MenuItem onClick={() => { router.push('/account/purchases'); handleMenuClose(); }}>My Purchases</MenuItem>
                                        <MenuItem onClick={() => { router.push('/cart'); handleMenuClose(); }}>My Cart</MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleSellerMenuOpen}>Seller Dashboard</MenuItem>
                                        <Divider />
                                        <MenuItem onClick={() => { router.push('/account/settings'); handleMenuClose(); }}>Settings</MenuItem>
                                        {userProfile?.isAdmin && (
                                            <MenuItem onClick={() => { router.push('/admin'); handleMenuClose(); }}>Admin Panel</MenuItem>
                                        )}
                                        <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                                    </Menu>
                                    {/* Seller Sub-Menu */}
                                    <Menu
                                        anchorEl={sellerMenuAnchorEl}
                                        open={Boolean(sellerMenuAnchorEl)}
                                        onClose={handleSellerMenuClose}
                                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    >
                                        <MenuItem onClick={() => { router.push('/account/sales'); handleMenuClose(); }}>Sales History</MenuItem>
                                        <MenuItem onClick={() => { router.push('/account/products'); handleMenuClose(); }}>My Products</MenuItem>
                                        <MenuItem onClick={() => { router.push('/account/products/add'); handleMenuClose(); }}>Add New Product</MenuItem>
                                    </Menu>
                                </>
                            )}
                        </Box>
                    ) : (
                        !isMobile && (
                            <>
                                <Button variant="contained" color="primary" onClick={() => router.push('/signup')} sx={{ color: 'white', mr: 1 }}>Sign Up</Button>
                                <Button variant="outlined" color="primary" onClick={() => router.push('/login')}>Sign In</Button>
                            </>
                        )
                    )}
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 3, mt: '64px' }}>
                {children}
            </Box>
            {isMobile && user && (
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.drawer + 2 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={bottomNavValue()}
                        onChange={(event, newValue) => {
                            if (newValue === 'home') router.push('/');
                            else if (newValue === 'chat') router.push('/chat');
                            else if (newValue === 'sell') router.push('/account/products/add');
                            else if (newValue === 'notifications') router.push('/notifications');
                            else if (newValue === 'account') router.push('/account/purchases'); // Default to purchases
                        }}
                    >
                        <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
                        <BottomNavigationAction label="Chat" value="chat" icon={<Badge badgeContent={unreadMsgCount} color="error"><ChatIcon /></Badge>} />
                        <BottomNavigationAction label="Sell" value="sell" icon={<AddCircleOutlineIcon />} />
                        <BottomNavigationAction label="Alerts" value="notifications" icon={<Badge badgeContent={unreadNotifCount} color="error"><NotificationsIcon /></Badge>} />
                        <BottomNavigationAction label="Account" value="account" icon={<AccountCircleIcon />} />
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
}