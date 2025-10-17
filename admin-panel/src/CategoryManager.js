import React, { useState, useEffect } from 'react';
import { functions, db } from './firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Button, List, ListItem, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const adminAddCategory = httpsCallable(functions, 'adminAddCategory');
const adminDeleteCategory = httpsCallable(functions, 'adminDeleteCategory');
const adminUpdateCategory = httpsCallable(functions, 'adminUpdateCategory');
const adminReorderCategories = httpsCallable(functions, 'adminReorderCategories');

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const q = query(collection(db, "categories"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      await adminAddCategory({ name: newCategoryName });
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDelete = async (categoryId) => {
      if(window.confirm('Are you sure?')) {
          await adminDeleteCategory({ categoryId });
          fetchCategories();
      }
  }

  const moveCategory = async (index, direction) => {
      const newCategories = [...categories];
      const [movedItem] = newCategories.splice(index, 1);
      newCategories.splice(index + direction, 0, movedItem);
      const orderedCategoryIds = newCategories.map(c => c.id);
      await adminReorderCategories({ orderedCategoryIds });
      setCategories(newCategories); // Optimistic update
  }

  return (
    <div>
      <h2>Manage Categories</h2>
      <TextField label="New Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
      <Button onClick={handleAddCategory}>Add Category</Button>
      <List>
        {categories.map((cat, index) => (
          <ListItem key={cat.id}>
            <ListItemText primary={cat.name} secondary={`Order: ${cat.order}`} />
            <Button onClick={() => moveCategory(index, -1)} disabled={index === 0}>Up</Button>
            <Button onClick={() => moveCategory(index, 1)} disabled={index === categories.length - 1}>Down</Button>
            <Button onClick={() => handleDelete(cat.id)}>Delete</Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default CategoryManager;
