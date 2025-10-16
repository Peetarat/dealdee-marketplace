import React, { useState, useEffect } from 'react';
  import { auth, functions } from './firebaseConfig';
  import { signOut } from 'firebase/auth';
  import { httpsCallable } from 'firebase/functions';
  import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem
  } from '@mui/material';

  const listUsers = httpsCallable(functions, 'listUsers');
  const setUserRole = httpsCallable(functions, 'setUserRole');

  const VALID_ROLES = ["unverified", "member", "seller_advanced", "seller_premium", "admin"];

  function Dashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the edit dialog
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listUsers();
        // Sort users by email before setting state
        const sortedUsers = result.data.users.sort((a, b) =>
          a.email.localeCompare(b.email)
        );
        setUsers(sortedUsers);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching users:", err);
      }
      setLoading(false);
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    const handleLogout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    const handleEditClick = (user) => {
      setEditingUser(user);
      setNewRole(user.role);
      setUpdateError(null);
    };

    const handleCloseDialog = () => {
      setEditingUser(null);
    };

    const handleSaveRole = async () => {
      if (!editingUser || !newRole) return;
      setIsSaving(true);
      setUpdateError(null);
      try {
        await setUserRole({ uid: editingUser.uid, role: newRole });
        // Refresh user list to show the new role
        await fetchUsers();
        handleCloseDialog();
      } catch (err) {
        setUpdateError(err.message);
        console.error("Error updating role:", err);
      }
      setIsSaving(false);
    };

    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        <Typography variant="body1" gutterBottom>
          Logged in as: {auth.currentUser?.email}
        </Typography>

        <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
          User List
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>UID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell component="th" scope="row">{user.uid}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleEditClick(user)}>Edit Role</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={!!editingUser} onClose={handleCloseDialog}>
          <DialogTitle>Edit Role for {editingUser?.email}</DialogTitle>
          <DialogContent>
            {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={newRole}
                label="Role"
                onChange={(e) => setNewRole(e.target.value)}
              >
                {VALID_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveRole} variant="contained" disabled={isSaving}>
              {isSaving ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    );
  }

  export default Dashboard;