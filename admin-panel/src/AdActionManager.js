import React, { useState, useEffect } from 'react';
import { functions, db } from './firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';
import { Button, List, ListItem, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Typography, Box, Grid } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { toast } from 'react-toastify';

const adminManageAdActions = httpsCallable(functions, 'adminManageAdActions');

const initialFormState = { name: '', description: '', creditCost: 0, type: 'PROMOTE_FLAG', parameters: { duration_hours: 24 } };

function AdActionManager() {
  const [actions, setActions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "adActions"), (snapshot) => {
      setActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const action = editingAction ? 'update' : 'add';
    const payload = editingAction ? { id: editingAction.id, ...formState } : formState;
    const toastId = toast.loading("Saving action...");
    try {
        await adminManageAdActions({ action, payload });
        toast.update(toastId, { render: "Action saved!", type: "success", isLoading: false, autoClose: 3000 });
        setIsDialogOpen(false);
    } catch (error) {
        toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  // ... (other handlers)

  return (
    <Paper sx={{p: 2}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Ad Actions & Costs</Typography>
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsDialogOpen(true)}>Add Action</Button>
        </Box>
        <List>
            {actions.map(act => (
                <ListItem key={act.id}>
                    <ListItemText primary={act.name} secondary={`Cost: ${act.creditCost} credits | Type: ${act.type} | Duration: ${act.parameters.duration_hours}h`} />
                </ListItem>
            ))}
        </List>
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <DialogTitle>{editingAction ? 'Edit' : 'Add'} Ad Action</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{pt: 1}}>
                    <Grid item xs={12}><TextField fullWidth label="Action Name" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Credit Cost" type="number" value={formState.creditCost} onChange={e => setFormState({...formState, creditCost: Number(e.target.value)})} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Duration (hours)" type="number" value={formState.parameters.duration_hours} onChange={e => setFormState({...formState, parameters: { duration_hours: Number(e.target.value) }})} /></Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    </Paper>
  );
}

export default AdActionManager;
