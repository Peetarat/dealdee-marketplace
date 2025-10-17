'''use client';

import React, { useState, useEffect } from 'react';
import { useAppTheme } from './AppThemeProvider';
import { db, auth } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import CategoryQuickFilter from './CategoryQuickFilter';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem, 
    ListItemIcon, ListItemText, useTheme, useMediaQuery, Paper, BottomNavigation, 
    BottomNavigationAction, Avatar, Badge
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
// ... other imports

// ... (UserAvatar component)

export default function AppLayout({ children }: { children: React.ReactNode }) {
    // ... (hooks and state)
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch user profile
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data());
                }

                // Listen for unread notifications
                const notifQuery = query(
                    collection(db, "notifications"),
                    where("userId", "==", currentUser.uid),
                    where("isRead", "==", false)
                );
                const unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
                    setUnreadCount(snapshot.size);
                });
                return () => unsubscribeNotifs(); // Cleanup notification listener
            } else {
                setUserProfile(null);
                setUnreadCount(0);
            }
        });
        return () => unsubscribeAuth(); // Cleanup auth listener
    }, []);

    // ... (drawer, handleDrawerToggle, etc.)

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {/* ... hamburger, title ... */}
                    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">{/* ... */}</IconButton>
                    <IconButton color="inherit" onClick={() => router.push('/notifications')}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    {user ? (
                        <UserAvatar user={user} userProfile={userProfile} />
                    ) : (
                        <Button color="inherit" onClick={() => router.push('/login')}>Login</Button>
                    )}
                </Toolbar>
            </AppBar>
            {/* ... rest of layout ... */}
        </Box>
    );
}
'''