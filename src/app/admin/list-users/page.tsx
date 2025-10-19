'use client';

import React, { useState } from 'react';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { Button, CircularProgress, Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const listUsers = httpsCallable(functions, 'admin_listUsers');

interface UserInfo {
    uid: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
}

export default function ListUsersPage() {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const result: any = await listUsers();
            setUsers(result.data.users);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, m: 3 }}>
            <Typography variant="h5" gutterBottom>Admin: List Users</Typography>
            <Button variant="contained" onClick={handleFetchUsers} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Fetch All Users"}
            </Button>

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    Error: {error}
                </Typography>
            )}

            {users.length > 0 && (
                <List sx={{ mt: 2 }}>
                    {users.map(user => (
                        <ListItem key={user.uid} divider>
                            <ListItemText 
                                primary={`${user.displayName || 'No Name'} - ${user.email}`}
                                secondary={`UID: ${user.uid} | Admin: ${user.isAdmin ? 'Yes' : 'No'}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
}
