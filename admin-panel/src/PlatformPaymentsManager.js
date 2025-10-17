import React, { useState, useEffect } from 'react';
import { functions, db } from './firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';
import { Button, List, ListItem, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const adminManagePlatformPayments = httpsCallable(functions, 'adminManagePlatformPayments');

function PlatformPaymentsManager() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formState, setFormState] = useState({ type: '', details: '' });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "platformPaymentMethods"), (snapshot) => {
      setMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const action = editingMethod ? 'update' : 'add';
    const payload = editingMethod ? { id: editingMethod.id, details: formState.details } : { type: formState.type, details: formState.details };
    const toastId = toast.loading("Saving...");
    try {
        await adminManagePlatformPayments({ action, payload });
        toast.update(toastId, { render: "Saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
        setIsDialogOpen(false);
    } catch (error) {
        toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  // ... (other handlers for open/close dialog, delete)

  return (
    <Paper sx={{p: 2}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Platform Payment Methods</Typography>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsDialogOpen(true)}>Add Method</Button>
        </Box>
        <List>
            {methods.map(method => (
                <ListItem key={method.id} secondaryAction={<IconButton><DeleteIcon /></IconButton>}>
                    <ListItemText primary={method.type} secondary={JSON.stringify(method.details)} />
                </ListItem>
            ))}
        </List>
        {/* ... Dialog for add/edit form ... */}
    </Paper>
  );
}

export default PlatformPaymentsManager;
