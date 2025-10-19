'use client';

import React, { useState, useEffect } from 'react';
import { db, auth, functions } from '../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { 
    Container, Box, Paper, Typography, Button, CircularProgress, List, ListItem, 
    ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, 
    DialogActions, Select, MenuItem, FormControl, InputLabel, Chip 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

// Assume these functions will be created in Firebase
const addPaymentMethod = httpsCallable(functions, 'addPaymentMethod');
const deletePaymentMethod = httpsCallable(functions, 'deletePaymentMethod');
const setPrimaryMethod = httpsCallable(functions, 'setPrimaryMethod');

interface PaymentMethod {
    id: string;
    type: 'PROMPTPAY' | 'BANK_ACCOUNT';
    isPrimary: boolean;
    promptPayPhoneNumber?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankName?: string;
}

export default function PaymentSettingsPage() {
    const [user] = useAuthState(auth);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMethod, setNewMethod] = useState({ 
        type: 'PROMPTPAY', 
        promptPayPhoneNumber: '', 
        bankAccountName: '', 
        bankAccountNumber: '', 
        bankName: '' 
    });

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "sellerPaymentMethods"), where("sellerId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userMethods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentMethod[];
            setMethods(userMethods);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddMethod = async () => {
        const toastId = toast.loading("Adding method...");
        try {
            await addPaymentMethod(newMethod);
            toast.update(toastId, { render: "Method added successfully!", type: "success", isLoading: false, autoClose: 3000 });
            setIsDialogOpen(false);
            // Clear form
            setNewMethod({ type: 'PROMPTPAY', promptPayPhoneNumber: '', bankAccountName: '', bankAccountNumber: '', bankName: '' });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleDelete = async (methodId: string) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;
        const toastId = toast.loading("Deleting method...");
        try {
            await deletePaymentMethod({ methodId });
            toast.update(toastId, { render: "Method deleted.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleSetPrimary = async (methodId: string) => {
        const toastId = toast.loading("Setting as primary...");
        try {
            await setPrimaryMethod({ methodId });
            toast.update(toastId, { render: "Primary method updated.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container component="main" maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography component="h1" variant="h4">Manage Payment Methods</Typography>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsDialogOpen(true)}>Add New</Button>
                </Box>

                <List>
                    {methods.map(method => (
                        <ListItem key={method.id} secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(method.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText 
                                primary={method.type === 'PROMPTPAY' ? `PromptPay: ${method.promptPayPhoneNumber}` : `Bank: ${method.bankName} - ${method.bankAccountNumber}`}
                                secondary={method.type === 'BANK_ACCOUNT' ? `Name: ${method.bankAccountName}` : null}
                            />
                            {method.isPrimary && <Chip icon={<StarIcon />} label="Primary" color="success" sx={{ mr: 2 }}/>}
                            {!method.isPrimary && <Button onClick={() => handleSetPrimary(method.id)}>Set as Primary</Button>}
                        </ListItem>
                    ))}
                </List>
                {methods.length === 0 && <Typography color="text.secondary" align="center">No payment methods added yet.</Typography>}
            </Paper>

            {/* Add Method Dialog */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth>
                <DialogTitle>Add a New Payment Method</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={newMethod.type} onChange={(e) => setNewMethod({...newMethod, type: e.target.value})} label="Type">
                            <MenuItem value="PROMPTPAY">PromptPay</MenuItem>
                            <MenuItem value="BANK_ACCOUNT">Bank Account</MenuItem>
                        </Select>
                    </FormControl>
                    {newMethod.type === 'PROMPTPAY' && (
                        <TextField autoFocus margin="dense" name="promptPayPhoneNumber" label="PromptPay Phone Number" type="text" fullWidth value={newMethod.promptPayPhoneNumber} onChange={(e) => setNewMethod({...newMethod, promptPayPhoneNumber: e.target.value})} />
                    )}
                    {newMethod.type === 'BANK_ACCOUNT' && (
                        <>
                            <TextField autoFocus margin="dense" name="bankName" label="Bank Name" type="text" fullWidth value={newMethod.bankName} onChange={(e) => setNewMethod({...newMethod, bankName: e.target.value})} />
                            <TextField margin="dense" name="bankAccountNumber" label="Account Number" type="text" fullWidth value={newMethod.bankAccountNumber} onChange={(e) => setNewMethod({...newMethod, bankAccountNumber: e.target.value})} />
                            <TextField margin="dense" name="bankAccountName" label="Account Holder Name" type="text" fullWidth value={newMethod.bankAccountName} onChange={(e) => setNewMethod({...newMethod, bankAccountName: e.target.value})} />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMethod} variant="contained">Add Method</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
