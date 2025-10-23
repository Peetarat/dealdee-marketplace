''''use client';

import React, { useState } from 'react';
import { Box, Grid, Paper, IconButton, Typography } from '@mui/material';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import DeleteIcon from '@mui/icons-material/Delete';

interface ProfileGalleryProps {
  images: string[];
  isEditing?: boolean;
  onDelete?: (index: number) => void;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ images = [], isEditing = false, onDelete }) => {
  const [index, setIndex] = useState(-1);

  const slides = images.map((src) => ({ src }));

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
      <Typography variant="h6" gutterBottom>Gallery</Typography>
      <Grid container spacing={1}>
        {images.map((image, i) => (
          <Grid item xs={4} sm={3} key={i}>
            <Box
              sx={{
                position: 'relative',
                cursor: 'pointer',
                aspectRatio: '1 / 1',
                '& > img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                },
              }}
            >
              <img src={image} alt={`Gallery image ${i + 1}`} onClick={() => setIndex(i)} />
              {isEditing && onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(i)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
      />
    </Paper>
  );
};

export default ProfileGallery;
''''