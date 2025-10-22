'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function AdminCategoriesPage() {

  // TODO: Fetch categories from Firestore
  // TODO: Implement state for categories, loading, error
  // TODO: Implement Add/Edit/Delete dialogs
  // TODO: Implement drag-and-drop reordering

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Category Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add New Category
        </Button>
      </Box>

      {/* Placeholder for the category list/table */}
      <Box sx={{ border: '2px dashed grey', p: 4, textAlign: 'center', borderRadius: '16px' }}>
        <Typography color="text.secondary">
          Category list and drag-and-drop interface will be implemented here.
        </Typography>
      </Box>

    </Container>
  );
}
