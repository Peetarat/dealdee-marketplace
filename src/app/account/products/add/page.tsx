'use client';

import React, { useState } from 'react';
import { db, auth, functions } from '../../../firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { Container, Box, Paper, Typography, TextField, Button, CircularProgress, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useRouter } from 'next/navigation';

// Assume createProduct function is defined in your Firebase Functions
const createProduct = httpsCallable(functions, 'createProduct');

export default function AddProductPage() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '1',
        category: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSelectChange = (e: any) => {
        setProductData(prev => ({ ...prev, category: e.target.value as string }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to add a product.");
            return;
        }
        setLoading(true);
        const toastId = toast.loading("Adding your product...");

        try {
            const price = parseFloat(productData.price);
            const stock = parseInt(productData.stock, 10);
            if (isNaN(price) || price <= 0) {
                throw new Error("Price must be a positive number.");
            }
            if (isNaN(stock) || stock <= 0) {
                throw new Error("Stock must be a positive number.");
            }

            const payload = { ...productData, price, stock };
            
            // This will fail until the function is deployed
            await createProduct(payload);

            toast.update(toastId, { render: "Product added successfully! You can publish it from 'My Products' page.", type: "success", isLoading: false, autoClose: 5000 });
            router.push('/account/products'); // Redirect to a page where they can see their products
        } catch (error: any) {
            console.error("Error adding product:", error);
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Add a New Product
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                name="name"
                                required
                                fullWidth
                                id="name"
                                label="Product Name"
                                autoFocus
                                value={productData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                required
                                fullWidth
                                id="description"
                                label="Product Description"
                                multiline
                                rows={4}
                                value={productData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="price"
                                required
                                fullWidth
                                id="price"
                                label="Price ($)"
                                type="number"
                                value={productData.price}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="stock"
                                required
                                fullWidth
                                id="stock"
                                label="Stock Quantity"
                                type="number"
                                value={productData.stock}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                    labelId="category-label"
                                    id="category"
                                    name="category"
                                    value={productData.category}
                                    label="Category"
                                    onChange={handleSelectChange}
                                >
                                    {/* These should probably be fetched from Firestore */}
                                    <MenuItem value="electronics">Electronics</MenuItem>
                                    <MenuItem value="fashion">Fashion</MenuItem>
                                    <MenuItem value="hobbies">Hobbies</MenuItem>
                                    <MenuItem value="home">Home</MenuItem>
                                    <MenuItem value="kids">Kids</MenuItem>
                                    <MenuItem value="otop">OTOP</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 4, mb: 2, borderRadius: '20px' }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Add Product"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}