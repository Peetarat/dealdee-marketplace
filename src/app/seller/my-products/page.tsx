'''use client';

import React, { useState, useEffect } from 'react';
import { db, auth, functions } from '../../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';
import {
    Box, Typography, Button, CircularProgress, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, 
    DialogContent, List, ListItem, ListItemText, DialogActions
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';

const applyAdToProduct = httpsCallable(functions, 'applyAdToProduct');

export default function MyProductsPage() {
    const [user] = useAuthState(auth);
    const [products, setProducts] = useState<any[]>([]);
    const [adActions, setAdActions] = useState<any[]>([]);
    const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "products"), where("ownerId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        // Fetch Ad Actions
        const adActionsQuery = query(collection(db, "adActions"));
        const unsubAdActions = onSnapshot(adActionsQuery, (snap) => setAdActions(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { unsubscribe(); unsubAdActions(); };
    }, [user]);

    const handleOpenPromoDialog = (product: any) => {
        setSelectedProduct(product);
        setIsPromoDialogOpen(true);
    };

    const handleApplyPromo = async () => {
        if (!selectedProduct || !selectedAction) return;
        const toastId = toast.loading("Applying promotion...");
        try {
            await applyAdToProduct({ productId: selectedProduct.id, actionId: selectedAction });
            toast.update(toastId, { render: "Promotion applied!", type: "success", isLoading: false, autoClose: 3000 });
            setIsPromoDialogOpen(false);
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>My Products</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead> {/* ... Table Headers ... */} </TableHead>
                    <TableBody>
                        {products.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.isPromoted ? `Promoted until ${new Date(p.promotedUntil.seconds * 1000).toLocaleDateString()}` : 'Not Promoted'}</TableCell>
                                <TableCell><Button startIcon={<CampaignIcon />} onClick={() => handleOpenPromoDialog(p)}>Promote</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={isPromoDialogOpen} onClose={() => setIsPromoDialogOpen(false)}>
                <DialogTitle>Promote: {selectedProduct?.name}</DialogTitle>
                <DialogContent>
                    <Typography>Select a promotion to apply:</Typography>
                    <List>
                        {adActions.map(action => (
                            <ListItem button selected={selectedAction === action.id} key={action.id} onClick={() => setSelectedAction(action.id)}>
                                <ListItemText primary={action.name} secondary={`Cost: ${action.creditCost} credits`} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPromoDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleApplyPromo} variant="contained" disabled={!selectedAction}>Apply</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
