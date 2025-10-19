'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, auth } from '../../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import {
    Box, Typography, Button, CircularProgress, Paper, TextField, 
    FormControlLabel, Switch, Container
} from '@mui/material';

export default function EditProductPage() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const params = useParams();
    const { productId } = params;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user || !productId) return;

        const fetchProduct = async () => {
            setLoading(true);
            const productRef = doc(db, 'products', productId as string);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const productData = productSnap.data();
                if (productData.ownerId === user.uid) {
                    setProduct({ id: productSnap.id, ...productData });
                } else {
                    toast.error("You don't have permission to edit this product.");
                    router.push('/account/products');
                }
            } else {
                toast.error("Product not found.");
                router.push('/account/products');
            }
            setLoading(false);
        };

        fetchProduct();
    }, [user, productId, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setProduct((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSaveChanges = async () => {
        if (!product) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Saving changes...");

        try {
            const productRef = doc(db, 'products', product.id);
            // Exclude id from the data to be saved
            const { id, ...dataToSave } = product;
            await updateDoc(productRef, dataToSave);
            toast.update(toastId, { render: "Changes saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
            router.push('/account/products');
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
    }

    if (!product) {
        return null; // or a not found component
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Edit Product
                </Typography>
                <Box component="form" noValidate autoComplete="off">
                    <TextField
                        fullWidth
                        label="Product Name"
                        name="name"
                        value={product.name || ''}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={product.description || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={product.price || 0}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Stock"
                        name="stock"
                        type="number"
                        value={product.stock || 0}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={product.isPublished || false}
                                onChange={handleInputChange}
                                name="isPublished"
                            />
                        }
                        label="Publish Product"
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="text" onClick={() => router.push('/account/products')} sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSaveChanges} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
