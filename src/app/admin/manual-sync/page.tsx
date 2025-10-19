'use client';

import React, { useState } from 'react';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { Button, CircularProgress, Box, Typography, Paper, Alert } from '@mui/material';

const manualSync = httpsCallable(functions, 'admin_manualSync');

export default function ManualSyncPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSync = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response: any = await manualSync();
            setResult(`Sync complete! Processed ${response.data.count || 0} records.`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, m: 3 }}>
            <Typography variant="h5" gutterBottom>Admin: Manual Algolia Sync</Typography>
            <Typography paragraph>This tool will read all products from your Firestore database and push them to your Algolia index. Use this if you suspect the automatic sync is not working.</Typography>
            <Button variant="contained" color="warning" onClick={handleSync} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Start Manual Sync"}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error: {error}
                </Alert>
            )}

            {result && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {result}
                </Alert>
            )}
        </Paper>
    );
}
