'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { Container, Box, Paper, Typography, TextField, Button, CircularProgress, Grid, Select, MenuItem, InputLabel, FormControl, FormHelperText, Divider, IconButton, RadioGroup, FormControlLabel, Radio, ListItemIcon, Autocomplete, Chip, SelectChangeEvent } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

// Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import { collection, getDocs, query, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { iconMap } from '../../../components/IconMap';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

interface Category {
  id: string;
  names: { [key: string]: string };
  icon: string;
  subCategories?: Category[];
}

interface FilePreview extends File {
  preview: string;
  isVideo: boolean;
}

export default function AddProductPage() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Expanded state for all form fields
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '1',
        condition: 'new',
        location: '',
    });
    const [tags, setTags] = useState<string[]>([]);
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
    const [subCategoryOptions, setSubCategoryOptions] = useState<Category[]>([]);
    const [coverMedia, setCoverMedia] = useState<FilePreview[]>([]);
    const [additionalMedia, setAdditionalMedia] = useState<FilePreview[]>([]);

    // Fetch and Sort Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesQuery = query(collection(db, 'categories'));
                const querySnapshot = await getDocs(categoriesQuery);
                let categoriesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Category);
                
                // Sort categories alphabetically by English name
                categoriesData.sort((a, b) => (a.names.en || a.id).localeCompare(b.names.en || b.id));

                setCategories(categoriesData);
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, []);

    const handleMainCategoryChange = (e: SelectChangeEvent) => {
        const mainCatId = e.target.value as string;
        setSelectedMainCategoryId(mainCatId);
        setSelectedSubCategoryId(''); // Reset sub-category

        const selectedCategory = categories.find(cat => cat.id === mainCatId);
        if (selectedCategory && selectedCategory.subCategories) {
            setSubCategoryOptions(selectedCategory.subCategories);
        } else {
            setSubCategoryOptions([]);
        }
    };

    const handleSubCategoryChange = (e: SelectChangeEvent) => {
        setSelectedSubCategoryId(e.target.value as string);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name as string]: value }));
    };

    const onDrop = useCallback((acceptedFiles: File[], type: 'cover' | 'additional') => {
        const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            isVideo: file.type.startsWith('video/'),
        }));

        if (type === 'cover') {
            setCoverMedia(filesWithPreview.slice(0, 1)); // Only one cover
        } else {
            const newVideos = filesWithPreview.filter(f => f.isVideo);
            const newImages = filesWithPreview.filter(f => !f.isVideo);

            const currentVideoCount = additionalMedia.filter(f => f.isVideo).length;
            const currentImageCount = additionalMedia.filter(f => !f.isVideo).length;

            if (currentVideoCount > 0 && newVideos.length > 0) {
                toast.error("You can only upload 1 additional video.");
                return;
            }
            if (currentImageCount + newImages.length > 10) {
                toast.error(`You can only upload up to 10 additional images. You have ${currentImageCount} already.`);
                return;
            }

            setAdditionalMedia(prev => [...prev, ...filesWithPreview]);
        }
    }, [additionalMedia]);

    const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({ onDrop: (files) => onDrop(files, 'cover'), accept: { 'image/*': [], 'video/*': [] }, maxFiles: 1 });
    const { getRootProps: getAdditionalRootProps, getInputProps: getAdditionalInputProps } = useDropzone({ onDrop: (files) => onDrop(files, 'additional'), accept: { 'image/*': [], 'video/*': [] } });

    const removeMedia = (fileToRemove: FilePreview, type: 'cover' | 'additional') => {
        if (type === 'cover') {
            setCoverMedia([]);
        } else {
            setAdditionalMedia(prev => prev.filter(file => file !== fileToRemove));
        }
        URL.revokeObjectURL(fileToRemove.preview);
    };

    const renderFilePreviews = (files: FilePreview[], type: 'cover' | 'additional') => (
        <Grid container spacing={1} sx={{ mt: 2 }}>
            {files.map((file, index) => (
                <Grid item key={index} xs={4} sm={3} md={2}>
                    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 1, overflow: 'hidden' }}>
                        {file.isVideo ? (
                            <>
                                <video src={file.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <VideocamIcon sx={{ position: 'absolute', bottom: 4, right: 4, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', p: 0.2 }}/>
                            </>
                        ) : (
                            <img src={file.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <IconButton size="small" onClick={() => removeMedia(file, type)} sx={{ position: 'absolute', top: 0, right: 0, color: 'white', background: 'rgba(0,0,0,0.5)' }}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();
        if (!user) return toast.error("You must be logged in.");

        const finalCategoryId = selectedSubCategoryId || selectedMainCategoryId;

        // Stricter validation for final submission, not for draft
        if (!isDraft) {
            if (coverMedia.length === 0) return toast.error("Please add a cover image or video.");
            if (!productData.name || !productData.price || !finalCategoryId) {
                return toast.error("Please fill in all required fields: Name, Price, and Category.");
            }
        }

        setLoading(true);
        const toastId = toast.loading(isDraft ? "Saving draft..." : "Uploading media and creating product...");

        try {
            let mediaUrls: string[] = [];
            let coverImageUrl = '';
            let coverVideoUrl = '';
            let additionalMediaUrls: string[] = [];

            // Only upload media if it's not a draft submission
            if (!isDraft && coverMedia.length > 0) {
                const storage = getStorage();
                const uploadFile = async (file: File, path: string) => {
                    const storageRef = ref(storage, path);
                    await uploadBytes(storageRef, file);
                    return await getDownloadURL(storageRef);
                };

                const timestamp = Date.now();
                const allFiles = [...coverMedia, ...additionalMedia];
                const uploadPromises = allFiles.map((file, index) => 
                    uploadFile(file, `products/${user.uid}/${timestamp}-${index}-${file.name}`)
                );
                mediaUrls = await Promise.all(uploadPromises);
                
                const coverFile = coverMedia[0];
                coverImageUrl = coverFile.isVideo ? '' : mediaUrls[0];
                coverVideoUrl = coverFile.isVideo ? mediaUrls[0] : '';
                additionalMediaUrls = mediaUrls.slice(1);
            }

            const productPayload = {
                ownerId: user.uid,
                name: productData.name || 'Untitled Draft',
                description: productData.description,
                price: parseFloat(productData.price) || 0,
                stock: parseInt(productData.stock, 10) || 0,
                categoryId: finalCategoryId,
                condition: productData.condition,
                location: productData.location,
                tags: tags, // Add tags to payload
                coverImageUrl,
                coverVideoUrl,
                additionalMediaUrls,
                isPublished: false, // Always false on initial creation/draft
                isPromoted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, "products"), productPayload);

            toast.update(toastId, { render: isDraft ? "Draft saved!" : "Product created successfully!", type: "success", isLoading: false, autoClose: 5000 });
            router.push('/account/products');

        } catch (error: any) {
            console.error("Error creating product:", error);
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const renderCategoryOptions = (categories: Category[]) => {
        return categories.map(cat => {
            const IconComponent = iconMap[cat.icon] || HelpOutlineIcon;
            return (
                <MenuItem key={cat.id} value={cat.id}>
                    <ListItemIcon sx={{ color: 'text.primary' }}>
                        <IconComponent />
                    </ListItemIcon>
                    {cat.names.en || cat.id}
                </MenuItem>
            );
        });
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ my: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold">
                Add a New Product
            </Typography>
            <Box component="form" onSubmit={(e) => handleSubmit(e, false)} noValidate sx={{ mt: 3 }}>
                <Grid container spacing={4}>
                    {/* Media Section */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Cover Media (Image or Video)</Typography>
                            <Box {...getCoverRootProps()} sx={{ border: '2px dashed grey', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
                                <input {...getCoverInputProps()} />
                                <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                <Typography>Drop your cover file here, or click to select</Typography>
                                <FormHelperText>For best results, use a 1:1 aspect ratio. Videos should be under 5MB.</FormHelperText>
                            </Box>
                            {coverMedia.length > 0 && renderFilePreviews(coverMedia, 'cover')}
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="h6" gutterBottom>Additional Media</Typography>
                            <Box {...getAdditionalRootProps()} sx={{ border: '2px dashed grey', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
                                <input {...getAdditionalInputProps()} />
                                <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                <Typography>Drop additional files here, or click to select</Typography>
                                <FormHelperText>Max 10 images and 1 video. Check file size limits.</FormHelperText>
                            </Box>
                            {additionalMedia.length > 0 && renderFilePreviews(additionalMedia, 'additional')}
                        </Paper>
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Product Details</Typography>
                            <Grid container spacing={3} sx={{pt: 1}}>
                                <Grid item xs={12}>
                                    <TextField name="name" required fullWidth label="Product Name" value={productData.name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField name="description" required fullWidth label="Product Description" multiline rows={6} value={productData.description} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={subCategoryOptions.length > 0 ? 6 : 12}>
                                    <FormControl fullWidth required>
                                        <InputLabel id="category-label">Category</InputLabel>
                                        <Select labelId="category-label" name="mainCategoryId" value={selectedMainCategoryId} label="Category" onChange={handleMainCategoryChange}>
                                            {renderCategoryOptions(categories)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {subCategoryOptions.length > 0 && (
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel id="subcategory-label">Sub-Category</InputLabel>
                                            <Select labelId="subcategory-label" name="subCategoryId" value={selectedSubCategoryId} label="Sub-Category" onChange={handleSubCategoryChange}>
                                                {subCategoryOptions.map(sub => (
                                                    <MenuItem key={sub.id} value={sub.id}>{sub.names.en || sub.id}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={[]}
                                        value={tags}
                                        onChange={(event, newValue) => {
                                            setTags(newValue as string[]);
                                        }}
                                        renderTags={(value: readonly string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                // eslint-disable-next-line react/jsx-key
                                                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label="Tags / Keywords"
                                                placeholder="Add up to 5 tags"
                                            />
                                        )}
                                    />
                                    <FormHelperText>Press Enter to add a tag. Tags help buyers find your product.</FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <Typography component="legend" variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Condition</Typography>
                                        <RadioGroup row name="condition" value={productData.condition} onChange={handleChange}>
                                            <FormControlLabel value="new" control={<Radio />} label="New" />
                                            <FormControlLabel value="used" control={<Radio />} label="Used" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Pricing & Location Section */}
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                             <Typography variant="h6" gutterBottom>Pricing & Location</Typography>
                             <Grid container spacing={3} sx={{pt: 1}}>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="price" required fullWidth label="Price (THB)" type="number" value={productData.price} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="stock" required fullWidth label="Stock Quantity" type="number" value={productData.stock} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField name="location" required fullWidth label="Item Location" value={productData.location} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, mt: 4, mb: 2 }}>
                    <Button
                        onClick={(e) => handleSubmit(e, true)}
                        fullWidth
                        variant="outlined"
                        size="large"
                        sx={{ borderRadius: '20px', py: 1.5 }}
                        disabled={loading}
                    >
                        Save Draft
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ borderRadius: '20px', py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit for Review"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}