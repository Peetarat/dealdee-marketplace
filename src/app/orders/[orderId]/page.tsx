'use client';

import React, { useState, useEffect } from 'react';
import { db, storage, functions } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { useParams } from 'next/navigation';
import { Container, Box, Typography, CircularProgress, Paper, Grid, Button, Alert, Chip, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

const confirmSlipUpload = httpsCallable(functions, 'confirmSlipUpload');
const completeOrder = httpsCallable(functions, 'completeOrder');

interface Order {
    id: string;
    status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'shipped' | 'awaiting_pickup' | 'completed' | 'cancelled';
    productDetails: { name: string; price: number; imageUrls: string[] };
    totalPrice: number;
    paymentDetails: any;
    slipImageUrl?: string;
    trackingNumber?: string;
}

export default function OrderDetailPage() {
    const { orderId } = useParams(); // Changed from id to orderId
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        const unsub = onSnapshot(doc(db, "orders", orderId as string), (doc) => { // Changed from id to orderId
            if (doc.exists()) {
                setOrder({ id: doc.id, ...doc.data() } as Order);
            } else {
                setError("Order not found.");
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching order:", err);
            setError("Failed to fetch order details.");
            setLoading(false);
        });
        return () => unsub();
    }, [orderId]); // Changed from id to orderId

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !order) return;

        setUploading(true);
        const toastId = toast.loading("Uploading your payment slip...");

        try {
            const filePath = `slips/${order.id}/${file.name}`;
            const storageRef = ref(storage, filePath);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            await confirmSlipUpload({ orderId: order.id, slipImageUrl: downloadURL });

            toast.update(toastId, { render: "Slip uploaded successfully!", type: "success", isLoading: false, autoClose: 5000 });
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.update(toastId, { render: `Upload failed: ${err.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setUploading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!order || !confirm("Are you sure you have received the item?")) return;
        const toastId = toast.loading("Completing order...");
        try {
            await completeOrder({ orderId: order.id });
            toast.update(toastId, { render: "Order completed! Thank you.", type: "success", isLoading: false, autoClose: 5000 });
        } catch (err: any) {
            toast.update(toastId, { render: `Error: ${err.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const renderPaymentDetails = () => {
        if (!order?.paymentDetails) return <Alert severity="warning">Seller payment details not available.</Alert>;
        const { type, promptPayPhoneNumber, bankName, bankAccountName, bankAccountNumber } = order.paymentDetails;
        if (type === 'PROMPTPAY') {
            return (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Pay with PromptPay</Typography>
                    <Typography><b>Phone Number:</b> {promptPayPhoneNumber}</Typography>
                </Paper>
            );
        }
        if (type === 'BANK_ACCOUNT') {
            return (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Pay via Bank Transfer</Typography>
                    <Typography><b>Bank:</b> {bankName}</Typography>
                    <Typography><b>Account Name:</b> {bankAccountName}</Typography>
                    <Typography><b>Account Number:</b> {bankAccountNumber}</Typography>
                </Paper>
            );
        }
        return <Alert severity="error">Unknown payment method type.</Alert>;
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

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 8 }} />;
    if (error) return <Typography color="error" align="center">{error}</Typography>;
    if (!order) return <Typography align="center">Order not found.</Typography>;

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <Typography variant="h4" component="h1" gutterBottom>Order Details</Typography>
                    <Chip label={order.status.replace('_', ' ').toUpperCase()} color={getStatusChipColor(order.status)} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>Order ID: {order.id}</Typography>

                <Grid container spacing={3} sx={{ my: 2 }}>
                    <Grid item xs={3} sm={2}>
                        <img src={order.productDetails.imageUrls?.[0] || 'https://via.placeholder.com/150'} alt={order.productDetails.name} style={{ width: '100%', borderRadius: '8px' }} />
                    </Grid>
                    <Grid item xs={9} sm={10}>
                        <Typography variant="h6">{order.productDetails.name}</Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">${order.totalPrice.toFixed(2)}</Typography>
                    </Grid>
                </Grid>

                {order.status === 'pending_payment' && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>Please transfer the total amount and upload your payment slip.</Alert>
                        {renderPaymentDetails()}
                        <Button variant="contained" component="label" fullWidth sx={{ mt: 3 }} disabled={uploading}>
                            {uploading ? <CircularProgress size={24} /> : "Upload Payment Slip"}
                            <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                        </Button>
                    </Box>
                )}

                {order.status === 'pending_confirmation' && <Alert severity="success">Slip uploaded. Waiting for seller confirmation.</Alert>}
                {order.status === 'confirmed' && <Alert severity="info">Payment confirmed. Awaiting shipment.</Alert>}
                {order.status === 'awaiting_pickup' && <Alert severity="info">Ready for pickup. Please coordinate with the seller.</Alert>}
                {order.status === 'shipped' && <Alert severity="success">Your order has been shipped!</Alert>}
                {order.status === 'completed' && <Alert severity="success" icon={<CheckCircleIcon />}>This order is complete. Thank you!</Alert>}

                {(order.status === 'shipped' || order.status === 'awaiting_pickup') && (
                    <Button variant="contained" onClick={handleCompleteOrder} fullWidth sx={{ mt: 3 }}>Confirm Receipt</Button>
                )}

                {order.trackingNumber && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">Tracking Information</Typography>
                        <TextField label="Tracking Number" value={order.trackingNumber} fullWidth InputProps={{ readOnly: true }} variant="filled" />
                    </Box>
                )}

                {order.slipImageUrl && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">Your Uploaded Slip</Typography>
                        <img src={order.slipImageUrl} alt="Payment Slip" style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px', borderRadius: '8px' }} />
                    </Box>
                )}
            </Paper>
        </Container>
    );
}