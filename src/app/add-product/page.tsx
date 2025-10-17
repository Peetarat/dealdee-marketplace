'use client';

import { useState, useEffect } from 'react';
import { db, auth, functions } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';
import {
    Typography, Grid, TextField, Button, Box, Alert, Select, MenuItem, 
    FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput, Paper, CircularProgress
} from '@mui/material';

// ... (rest of the component)
