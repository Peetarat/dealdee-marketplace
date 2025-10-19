'use client';

import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, Button, CircularProgress, Paper, Grid, Chip } from '@mui/material';
import { toast } from 'react-toastify';

const createOrder = httpsCallable(functions, 'createOrder');

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrls: string[];
    sellerId: string;
}

export default function ProductDetailPage() {
    const { productId } = useParams(); // Changed from id
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", productId as string); // Changed from id
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                } else {
                    setError("Product not found.");
                }
            } catch (err) {
                setError("Failed to fetch product details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]); // Changed from id

    const handleBuyNow = async () => {
        setIsOrdering(true);
        const toastId = toast.loading("Creating your order...");
        try {
            if (!product) throw new Error("Product data is not available.");

            const result: any = await createOrder({ productId: product.id });
            const { success, orderId } = result.data;

            if (success && orderId) {
                toast.update(toastId, { render: "Order created!", type: "success", isLoading: false, autoClose: 3000 });
                router.push(`/orders/${orderId}`);
            } else {
                throw new Error('Failed to create order.');
            }
        } catch (err: any) {
            toast.update(toastId, { render: `Error: ${err.message}`, type: "error", isLoading: false, autoClose: 5000 });
            setIsOrdering(false);
        }
    };

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 8 }} />;
    }

    if (error) {
        return <Typography color="error" align="center" sx={{ p: 4 }}>{error}</Typography>;
    }

    if (!product) {
        return <Typography align="center" sx={{ p: 4 }}>Product not found.</Typography>;
    }

    return (
        <Container sx={{ my: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <img src={product.imageUrls?.[0] || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>{product.name}</Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 2 }}>${product.price}</Typography>
                        <Chip label={`In Stock: ${product.stock}`} color={product.stock > 0 ? "success" : "error"} sx={{ mb: 2 }} />
                        <Typography variant="body1" sx={{ mb: 4 }}>{product.description}</Typography>
                        
                        <Button 
                            variant="contained" 
                            size="large" 
                            onClick={handleBuyNow}
                            disabled={isOrdering || product.stock === 0}
                            fullWidth
                        >
                            {isOrdering ? <CircularProgress size={24} /> : "Buy Now"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}