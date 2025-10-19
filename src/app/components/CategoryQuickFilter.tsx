'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, functions } from '../firebase';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';
import {
    Box, Chip, Button, Drawer, List, ListItem, ListItemText, IconButton, Typography, Divider, Paper
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Link from 'next/link';

const updatePinnedCategories = httpsCallable(functions, 'updatePinnedCategories');

export default function CategoryQuickFilter() {
    const [user, setUser] = useState<User | null>(null);
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchCategories = useCallback(async () => {
        const catQuery = query(collection(db, "categories"), orderBy("order"));
        const catSnap = await getDocs(catQuery);
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, []);

    const fetchUserData = useCallback(async (currentUser: User) => {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            setPinnedIds(userDocSnap.data().pinnedCategoryIds || []);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) fetchUserData(currentUser);
        });
        return () => unsubscribe();
    }, [fetchCategories, fetchUserData]);

    const handlePinToggle = async (categoryId: string) => {
        let newPinnedIds = [...pinnedIds];
        if (newPinnedIds.includes(categoryId)) {
            newPinnedIds = newPinnedIds.filter(id => id !== categoryId);
        } else {
            if (newPinnedIds.length >= 3) {
                toast.warn("You can only pin up to 3 categories.");
                return;
            }
            newPinnedIds.push(categoryId);
        }
        
        // Optimistic UI update
        setPinnedIds(newPinnedIds);

        try {
            await updatePinnedCategories({ categoryIds: newPinnedIds });
            toast.success("Pinned categories updated!");
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
            // Revert optimistic update on error
            fetchUserData(user!);
        }
    };

    const pinnedCats = categories.filter(c => pinnedIds.includes(c.id));
    const displayCats = pinnedCats.length > 0 ? pinnedCats : categories.slice(0, 3);

    return (
        <Paper elevation={1} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto' }}>
            {displayCats.slice(0, 11).map(cat => (
                <Link key={cat.id} href={`/search?category=${cat.name}`} passHref>
                    <Chip label={cat.name} component="a" clickable />
                </Link>
            ))}
            <Button size="small" startIcon={<MoreHorizIcon />} onClick={() => setIsDrawerOpen(true)}>More</Button>

            <Drawer anchor="left" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }} role="presentation">
                    <Typography variant="h6" gutterBottom>All Categories</Typography>
                    <Divider />
                    <List>
                        {categories.map((cat) => (
                            <ListItem key={cat.id} secondaryAction={
                                <IconButton edge="end" onClick={() => handlePinToggle(cat.id)} disabled={!user}>
                                    {pinnedIds.includes(cat.id) ? <StarIcon color="secondary" /> : <StarBorderIcon />}
                                </IconButton>
                            }>
                                <ListItemText primary={cat.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </Paper>
    );
}
