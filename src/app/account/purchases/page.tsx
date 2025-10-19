'use client';

import React, { useState, useEffect } from 'react';
import { db, auth, functions } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Paper, Typography, List, ListItem, ListItemText, Chip, CircularProgress, IconButton } from '@mui/material';
import Link from 'next/link';
import ArchiveIcon from '@mui/icons-material/Archive';
import { httpsCallable } from 'firebase/functions';

import { toast } from 'react-toastify';

const archiveOrder = httpsCallable(functions, 'archiveOrder');

interface Order {
    id: string;
    status: string;
    productDetails: { name: string; };
    totalPrice: number;
    createdAt: { seconds: number; };
}

export default function MyOrdersPage() {
    const [user] = useAuthState(auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "orders"), 
            where("buyerId", "==", user.uid),
            where("buyerArchived", "!=", true), // Hide archived orders
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
            setOrders(userOrders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleArchive = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        if (!confirm("Are you sure you want to archive this order? It will be hidden from this list.")) return;
        const toastId = toast.loading("Archiving order...");
        try {
            await archiveOrder({ orderId });
            toast.update(toastId, { render: "Order archived.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'warning';
            case 'pending_confirmation': return 'info';
            case 'confirmed': return 'primary';
            case 'shipped': return 'success';
            case 'awaiting_pickup': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>My Purchase History</Typography>
            <Paper elevation={2} sx={{ p: 2 }}>
                <List>
                    {orders.map(order => (
                        <Link href={`/orders/${order.id}`} key={order.id} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                            <ListItem button divider>
                                <ListItemText 
                                    primary={`${order.productDetails.name} - $${order.totalPrice.toFixed(2)}`}
                                    secondary={`Ordered on: ${new Date(order.createdAt.seconds * 1000).toLocaleDateString()}`}
                                />
                                <Chip label={order.status.replace('_', ' ').toUpperCase()} color={getStatusChipColor(order.status)} sx={{ mx: 2 }} />
                                <IconButton edge="end" aria-label="archive" onClick={(e) => handleArchive(e, order.id)}>
                                    <ArchiveIcon />
                                </IconButton>
                            </ListItem>
                        </Link>
                    ))}
                </List>
                {orders.length === 0 && <Typography color="text.secondary" align="center" sx={{ p: 3 }}>You have no purchase history yet.</Typography>}
            </Paper>
        </Container>
    );
}
