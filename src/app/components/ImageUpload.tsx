''''use client';

import React, { useState } from 'react';
import { storage } from '@/app/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Box, Button, LinearProgress, Typography, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  storagePath: string; // e.g., 'profile-pictures' or 'gallery-images/userId'
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete, storagePath }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    const fileRef = ref(storage, `${storagePath}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
        // Handle error (e.g., show a toast message)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadComplete(downloadURL);
          setUploading(false);
          setFile(null);
          setPreview(null);
        });
      }
    );
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
  };

  if (preview && file) {
    return (
      <Box sx={{ textAlign: 'center', border: '2px dashed grey', p: 2, borderRadius: 2 }}>
        <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '1rem' }} />
        {uploading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography>{Math.round(progress)}%</Typography>
          </Box>
        ) : (
          <Box>
            <Button variant="contained" onClick={handleUpload} sx={{ mr: 1 }}>Upload</Button>
            <IconButton onClick={handleCancel}><CancelIcon /></IconButton>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Button
      variant="outlined"
      component="label"
      startIcon={<PhotoCamera />}
    >
      Select Image
      <input type="file" accept="image/*" hidden onChange={handleFileChange} />
    </Button>
  );
};

export default ImageUpload;
''''