'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, auth, functions } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';
import {
    Box, Typography, Button, CircularProgress, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Switch, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// This function call is for a non-existent backend function, we can leave it for now
// but it will error if used.
const applyAdToProduct = httpsCallable(functions, 'applyAdToProduct');

export default function MyProductsPage() {
    const [user] = useAuthState(auth);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(collection(db, "products"), where("ownerId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            toast.error(`Failed to fetch products: ${error.message}`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handlePublishToggle = async (productId: string, currentStatus: boolean) => {
        const productRef = doc(db, 'products', productId);
        try {
            await updateDoc(productRef, { isPublished: !currentStatus });
            toast.success(`Product ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        } catch (error: any) {
            toast.error(`Error updating status: ${error.message}`);
        }
    };

    const openDeleteDialog = (product: any) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setProductToDelete(null);
        setDeleteDialogOpen(false);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        const toastId = toast.loading("Deleting product...");
        try {
            await deleteDoc(doc(db, 'products', productToDelete.id));
            toast.update(toastId, { render: "Product deleted successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error deleting product: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            closeDeleteDialog();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>My Products</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={p.isPublished || false}
                                        onChange={() => handlePublishToggle(p.id, p.isPublished)}
                                        name="isPublished"
                                        color="primary"
                                    />
                                    {p.isPublished ? 'Published' : 'Draft'}
                                </TableCell>
                                <TableCell align="right">
                                    <Link href={`/account/products/edit/${p.id}`} passHref>
                                        <IconButton color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Link>
                                    <IconButton color="error" onClick={() => openDeleteDialog(p)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
