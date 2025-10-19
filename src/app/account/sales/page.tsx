'use client';

import React, { useState, useEffect } from 'react';
import { db, auth, functions } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
    Container, Box, Paper, Typography, Button, CircularProgress, List, ListItem, 
    ListItemText, IconButton, Dialog, DialogTitle, DialogContent, Chip, Link as MuiLink 
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArchiveIcon from '@mui/icons-material/Archive';
import { toast } from 'react-toastify';

// Assume these functions will be created
const confirmOrder = httpsCallable(functions, 'confirmOrder');
const cancelOrder = httpsCallable(functions, 'cancelOrder');
const addTrackingInfo = httpsCallable(functions, 'addTrackingInfo');
const markForPickup = httpsCallable(functions, 'markForPickup');
const archiveOrder = httpsCallable(functions, 'archiveOrder');

interface Order {
    id: string;
    status: string;
    productDetails: { name: string; price: number; };
    totalPrice: number;
    slipImageUrl?: string;
    buyerId: string;
    trackingNumber?: string;
}

export default function SellerOrdersPage() {
    const [user] = useAuthState(auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "orders"), 
            where("sellerId", "==", user.uid),
            where("sellerArchived", "!=", true), // Hide archived orders
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sellerOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
            setOrders(sellerOrders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleConfirm = async (orderId: string) => {
        const toastId = toast.loading("Confirming order...");
        try {
            await confirmOrder({ orderId });
            toast.update(toastId, { render: "Order confirmed!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        const toastId = toast.loading("Cancelling order...");
        try {
            await cancelOrder({ orderId });
            toast.update(toastId, { render: "Order cancelled.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleAddTracking = async () => {
        if (!trackingOrder || !trackingNumber) return;
        const toastId = toast.loading("Saving tracking info...");
        try {
            // Determine if it's a new tracking number or an edit
            const functionToCall = trackingOrder.trackingNumber ? 'editTrackingInfo' : 'addTrackingInfo';
            const callable = httpsCallable(functions, functionToCall);
            await callable({ orderId: trackingOrder.id, trackingNumber });

            toast.update(toastId, { render: "Tracking info saved!", type: "success", isLoading: false, autoClose: 3000 });
            setTrackingOrder(null);
            setTrackingNumber('');
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleArchive = async (orderId: string) => {
        if (!confirm("Are you sure you want to archive this order? It will be hidden from this list.")) return;
        const toastId = toast.loading("Archiving order...");
        try {
            await archiveOrder({ orderId });
            toast.update(toastId, { render: "Order archived.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleMarkForPickup = async (orderId: string) => {
        if (!confirm("Are you sure you want to mark this order as ready for pickup?")) return;
        const toastId = toast.loading("Updating status...");
        try {
            await markForPickup({ orderId });
            toast.update(toastId, { render: "Order marked as ready for pickup.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom>My Sales Orders</Typography>
            <Paper elevation={2} sx={{ p: 2 }}>
                <List>
                    {orders.map(order => (
                        <ListItem key={order.id} divider>
                            <ListItemText 
                                primary={`${order.productDetails.name} - $${order.totalPrice.toFixed(2)}`}
                                secondary={order.trackingNumber ? `Tracking: ${order.trackingNumber}` : `Order ID: ${order.id}`}
                            />
                            <Chip label={order.status.replace('_', ' ').toUpperCase()} 
                                color={order.status === 'pending_confirmation' ? 'warning' : (order.status === 'confirmed' ? 'primary' : (order.status === 'shipped' ? 'success' : 'default'))} 
                                sx={{ mx: 2 }} />
                            
                            {order.status === 'pending_confirmation' && (
                                <Box>
                                    <Button variant="outlined" size="small" onClick={() => setSelectedSlip(order.slipImageUrl || null)} sx={{ mr: 1 }}>View Slip</Button>
                                    <IconButton color="success" onClick={() => handleConfirm(order.id)}><CheckCircleIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleCancel(order.id)}><CancelIcon /></IconButton>
                                </Box>
                            )}
                            {order.status === 'confirmed' && (
                                <Box>
                                    <Button variant="outlined" size="small" startIcon={<LocalShippingIcon />} onClick={() => { setTrackingOrder(order); setTrackingNumber(''); }} sx={{ mr: 1 }}>Add Tracking</Button>
                                    <Button variant="contained" size="small" onClick={() => handleMarkForPickup(order.id)}>Ready for Pickup</Button>
                                </Box>
                            )}
                            {order.status === 'shipped' && order.trackingNumber && (
                                <Button variant="outlined" size="small" onClick={() => { setTrackingOrder(order); setTrackingNumber(order.trackingNumber || ''); }}>Edit Tracking</Button>
                            )}
                            {(order.status === 'completed' || order.status === 'cancelled') && (
                                <IconButton aria-label="archive" onClick={() => handleArchive(order.id)}>
                                    <ArchiveIcon />
                                </IconButton>
                            )}
                        </ListItem>
                    ))}
                </List>
                {orders.length === 0 && <Typography color="text.secondary" align="center" sx={{ p: 3 }}>You have no orders yet.</Typography>}
            </Paper>

            {/* Slip Viewer Dialog */}
            <Dialog open={!!selectedSlip} onClose={() => setSelectedSlip(null)} maxWidth="md">
                <DialogTitle>Payment Slip</DialogTitle>
                <DialogContent>
                    <img src={selectedSlip || ''} alt="Payment Slip" style={{ width: '100%' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedSlip(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Tracking Dialog */}
            <Dialog open={!!trackingOrder} onClose={() => setTrackingOrder(null)}>
                <DialogTitle>Add Tracking Information</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus
                        margin="dense"
                        id="trackingNumber"
                        label="Tracking Number"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTrackingOrder(null)}>Cancel</Button>
                    <Button onClick={handleAddTracking}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
