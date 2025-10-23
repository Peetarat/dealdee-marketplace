'use client';

import React, { useState, useEffect } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
// Correct import: useAuthState instead of useAuth
import { useAuthState } from 'react-firebase-hooks/auth'; // <--- CORRECTED IMPORT ACCESS (using direct import)
import { auth, firestore } from '@/app/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Container, Typography, Paper, Box, CircularProgress, Chip, Button, Divider, Grid, TextField, IconButton, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useLanguage } from '@/app/components/LanguageProvider';
import TieredAvatar from '@/app/components/TieredAvatar';
import ImageUpload from '@/app/components/ImageUpload';
import ProfileGallery from '@/app/components/ProfileGallery';
import SocialLinks from '@/app/components/SocialLinks';
import CakeIcon from '@mui/icons-material/Cake';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { toast } from 'react-toastify';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: { seconds: number; nanoseconds: number; };
  tier: string;
  credits: number;
  isEmailVisible?: boolean;
  galleryImages?: string[];
  description?: string;
  socialLinks?: { [key: string]: string };
}

export default function DynamicProfilePage({ params }: { params: { userId: string } }) {
  const { t } = useLanguage();
  // Correct hook usage: useAuthState
  const [loggedInUser, authLoading] = useAuthState(auth); // <--- CORRECTED HOOK NAME
  const { userId } = params;

  const userDocRef = doc(firestore, 'users', userId);
  const [profile, profileLoading, profileError] = useDocumentData(userDocRef);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGalleryUploadModalOpen, setIsGalleryUploadModalOpen] = useState(false);

  // Editing states
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const [editedIsEmailVisible, setEditedIsEmailVisible] = useState(false);
  const [editedPhotoURL, setEditedPhotoURL] = useState<string | null>(null);
  const [editedGalleryImages, setEditedGalleryImages] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedSocialLinks, setEditedSocialLinks] = useState<{ [key: string]: string }>({});

  const userProfile = profile as UserProfile | null;
  const isOwner = loggedInUser?.uid === userId;

  useEffect(() => {
    if (userProfile) {
      setEditedDisplayName(userProfile.displayName || '');
      setEditedIsEmailVisible(userProfile.isEmailVisible || false);
      setEditedPhotoURL(userProfile.photoURL || null);
      setEditedGalleryImages(userProfile.galleryImages || []);
      setEditedDescription(userProfile.description || '');
      setEditedSocialLinks(userProfile.socialLinks || {});
    }
  }, [userProfile, isEditing]);

  const handleSave = async () => {
    if (!isOwner || !userDocRef || !loggedInUser) return;
    const toastId = toast.loading("Saving...");
    try {
      const dataToUpdate: any = {
        displayName: editedDisplayName,
        isEmailVisible: editedIsEmailVisible,
        galleryImages: editedGalleryImages,
        description: editedDescription,
        socialLinks: editedSocialLinks,
      };

      if (editedPhotoURL && editedPhotoURL !== userProfile?.photoURL) {
        dataToUpdate.photoURL = editedPhotoURL;
        // Also update Firebase Auth profile if photoURL changes
        await updateProfile(loggedInUser, { photoURL: editedPhotoURL });
      }

      await updateDoc(userDocRef, dataToUpdate);
      toast.update(toastId, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setIsEditing(false);
    } catch (error: any) {
      toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  const handleCancel = () => setIsEditing(false);

  const handleProfileUploadComplete = (url: string) => {
    setEditedPhotoURL(url);
    setIsUploadModalOpen(false);
    toast.success("Profile image updated! Click Save to apply.");
  }

  const handleGalleryUploadComplete = (url: string) => {
    if (editedGalleryImages.length < 8) {
      setEditedGalleryImages([...editedGalleryImages, url]);
      toast.success("Image added to gallery! Click Save to apply.");
    } else {
      toast.error("You can only have up to 8 gallery images.");
    }
    setIsGalleryUploadModalOpen(false);
  }

  const handleGalleryDelete = (index: number) => {
    setEditedGalleryImages(editedGalleryImages.filter((_, i) => i !== index));
  }

  const handleSocialLinkChange = (service: string, url: string) => {
    setEditedSocialLinks(prev => ({ ...prev, [service]: url }));
  }

  if (authLoading || profileLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (profileError) {
    return <Typography color="error">Error loading profile: {profileError.message}</Typography>;
  }

  if (!userProfile) {
    // Check if the user exists in Auth but not Firestore (shouldn't happen with our Cloud Function)
    if (loggedInUser && loggedInUser.uid === userId) {
        return <Typography color="error">Error: Profile data not found in database. Please contact support.</Typography>;
    }
    return <Typography>User profile not found.</Typography>;
  }

  const memberSince = userProfile.createdAt
    ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        {/* --- HEADER --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <TieredAvatar src={isEditing && isOwner ? editedPhotoURL : userProfile.photoURL} alt={userProfile.displayName} tier={userProfile.tier} size={120} />
            {isEditing && isOwner && (
              <IconButton onClick={() => setIsUploadModalOpen(true)} sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', '&:hover': { bgcolor: 'lightgray' } }}><AddAPhotoIcon /></IconButton>
            )}
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            {isEditing && isOwner ? (
              <Box>
                <TextField label="Display Name" variant="outlined" value={editedDisplayName} onChange={(e) => setEditedDisplayName(e.target.value)} sx={{ width: '100%', maxWidth: '400px', mb: 2 }}/>
                <FormControlLabel control={<Switch checked={editedIsEmailVisible} onChange={(e) => setEditedIsEmailVisible(e.target.checked)} />} label="Show email publicly"/>
              </Box>
            ) : (
              <Typography variant="h4" component="h1" fontWeight="bold">{userProfile.displayName || t('profile.anonymous_user')}</Typography>
            )}
            <Typography variant="body1" color="text.secondary">{userProfile.isEmailVisible || isOwner ? userProfile.email : '[Email Hidden]'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1, mt: 1, color: 'text.secondary' }}>
              <CakeIcon fontSize="small" />
              <Typography variant="body2">{t('profile.member_since')} {memberSince}</Typography>
            </Box>
            {/* Display existing social links when not editing */}
            {!isEditing && <SocialLinks links={userProfile.socialLinks} />}
          </Box>
          {isOwner && (
            <Box sx={{ ml: { sm: 'auto' }, mt: { xs: 2, sm: 0 }, display: 'flex', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button>
                  <IconButton onClick={handleCancel}><CancelIcon /></IconButton>
                </>
              ) : (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>{t('profile.edit_profile_button')}</Button>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* --- BODY --- */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>About Me</Typography>
              {isEditing && isOwner ? (
                <TextField label="About Me" multiline rows={4} variant="outlined" fullWidth value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{userProfile.description || 'No description provided.'}</Typography>
              )}
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Gallery</Typography>
                  {isEditing && isOwner && (
                    <Button variant="contained" size="small" startIcon={<AddPhotoAlternateIcon />} onClick={() => setIsGalleryUploadModalOpen(true)} disabled={editedGalleryImages.length >= 8}>Add Image</Button>
                  )}
              </Box>
              <ProfileGallery images={isEditing && isOwner ? editedGalleryImages : userProfile.galleryImages || []} isEditing={isEditing && isOwner} onDelete={handleGalleryDelete} />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
              <Typography variant="h6" gutterBottom>{t('profile.membership_level')}</Typography>
              <Chip label={userProfile.tier.charAt(0).toUpperCase() + userProfile.tier.slice(1)} color={userProfile.tier === 'starter' ? 'default' : 'success'} variant="filled" sx={{ fontWeight: 'bold' }} />
              {/* TODO: Add tier expiry date if exists */}
            </Paper>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
              <Typography variant="h6" gutterBottom>{t('profile.credit_balance')}</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">{userProfile.credits?.toLocaleString() ?? 0}</Typography>
              {/* TODO: Add link to buy credits */}
            </Paper>

            {isEditing && isOwner && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Social Links</Typography>
                <TextField label="Facebook URL" fullWidth variant="outlined" margin="dense" value={editedSocialLinks.facebook || ''} onChange={(e) => handleSocialLinkChange('facebook', e.target.value)} />
                <TextField label="Instagram URL" fullWidth variant="outlined" margin="dense" value={editedSocialLinks.instagram || ''} onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} />
                <TextField label="TikTok URL" fullWidth variant="outlined" margin="dense" value={editedSocialLinks.tiktok || ''} onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)} />
                {/* Add more social links as needed */}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* --- DIALOGS (only available to owner) --- */}
      {isOwner && (
        <>
          <Dialog open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Upload New Profile Picture</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>Max file size: 5MB. Allowed formats: JPG, PNG, WEBP.</Typography><ImageUpload onUploadComplete={handleProfileUploadComplete} storagePath={`profile-pictures/${loggedInUser?.uid}`} /></DialogContent><DialogActions><Button onClick={() => setIsUploadModalOpen(false)}>Close</Button></DialogActions></Dialog>
          <Dialog open={isGalleryUploadModalOpen} onClose={() => setIsGalleryUploadModalOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Add New Gallery Image</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>You can add up to 8 images. Max file size: 5MB.</Typography><ImageUpload onUploadComplete={handleGalleryUploadComplete} storagePath={`gallery-images/${loggedInUser?.uid}`} /></DialogContent><DialogActions><Button onClick={() => setIsGalleryUploadModalOpen(false)}>Close</Button></DialogActions></Dialog>
        </>
      )}

    </Container>
  );
}