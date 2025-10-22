'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, CircularProgress, Container, Box, Divider, Tooltip, IconButton, Chip, Avatar } from '@mui/material';
import Link from 'next/link';
import CategoryBar, { Category } from '@/app/components/CategoryBar';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useSearchParams } from 'next/navigation';

// Import necessary icons
import ShareIcon from '@mui/icons-material/Share';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrls: string[];
  isPublished: boolean;
  isPromoted: boolean;
  condition: 'new' | 'used';
  stock: { current: number, total: number };
  ownerInfo: { name: string, avatarUrl: string, level: string };
  likes: number;
  shareCount: number;
  location: string;
  ownerId: string;
  createdAt?: any;
}

// Product Card Component
const ProductCard = ({ product, isPromotedCard }: { product: Product, isPromotedCard?: boolean }) => {
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = () => {
        const likeSoundUrl = '/sounds/like-effect.mp3'; // This should come from a config/context later
        if (likeSoundUrl) {
            const audio = new Audio(likeSoundUrl);
            audio.play().catch(e => console.error("Error playing sound:", e));
        }
        setIsLiked(!isLiked);
    };

    const formatK = (num: number) => {
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num;
    }

    const getLevelAppearance = (level: string) => {
        switch (level) {
            case 'enterprise':
                return { borderColor: '#FFD700', Icon: WorkspacePremiumIcon, bgColor: '#FFD700', tooltip: 'Enterprise Member' };
            case 'business':
                return { borderColor: '#00796b', Icon: StarIcon, bgColor: '#00796b', tooltip: 'Business Member' };
            case 'pro':
                return { borderColor: 'primary.main', Icon: CheckCircleIcon, bgColor: 'primary.main', tooltip: 'Pro Member' };
            case 'admin':
                return { borderColor: '#9c27b0', Icon: AdminPanelSettingsIcon, bgColor: '#9c27b0', tooltip: 'Administrator' };
            case 'starter':
            default:
                return { borderColor: '#CD7F32', Icon: null, bgColor: '#CD7F32', tooltip: 'Starter Member' }; // Bronze
        }
    };

    const levelAppearance = getLevelAppearance(product.ownerInfo.level);

    return (
        <Card sx={{
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            position: 'relative',
            '@keyframes glowing-border-sharp': {
                '0%': { boxShadow: '0 0 3px #e57373' },
                '50%': { boxShadow: '0 0 6px 1px #d32f2f' },
                '100%': { boxShadow: '0 0 3px #e57373' },
            },
            ...(isPromotedCard && {
                animation: 'glowing-border-sharp 2s ease-in-out infinite',
            })
        }}>
            {isPromotedCard && (
                <Box sx={{
                    background: 'linear-gradient(to right, #d32f2f, #f44336)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 0.5,
                    gap: 0.5
                }}>
                    <WhatshotIcon sx={{ fontSize: '1rem' }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: '1' }}>PROMOTED</Typography>
                </Box>
            )}
            <Box sx={{ position: 'relative', aspectRatio: '1 / 1' }}>
                <CardMedia
                    component="img"
                    image={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/300'}
                    alt={product.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 0.5 }}>
                    <Tooltip title="Share">
                        <IconButton size="small" sx={{ color: 'white' }} onClick={() => console.log('Share clicked')}>
                            <ShareIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>{formatK(product.shareCount)}</Typography>
                </Box>

                <Tooltip title="Add to Wishlist">
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8, color: 'white', background: 'rgba(0,0,0,0.4)', '&:hover': {background: 'rgba(0,0,0,0.6)'} }} size="small" onClick={handleLikeClick}>
                        {isLiked ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

                <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', px: 1, py: 0.5 }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: '1rem', color: 'white', mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {product.stock.total === 1 ? '1' : `${product.stock.current}/${product.stock.total}`}
                    </Typography>
                </Box>

                {/* TODO: Add owner/admin check */}
                <Tooltip title="Delete Item">
                    <IconButton sx={{ position: 'absolute', bottom: 8, right: 8, color: 'white', background: 'rgba(0,0,0,0.4)', '&:hover': {background: 'rgba(0,0,0,0.6)'} }} size="small" onClick={() => console.log('Delete clicked')}>
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography gutterBottom variant="body1" component="div" noWrap sx={{ fontWeight: 'bold', flexGrow: 1, mr: 1 }}>
                        {product.name}
                    </Typography>
                    <Chip 
                        label={product.condition === 'new' ? 'NEW' : 'USED'} 
                        size="small" 
                        color={product.condition === 'new' ? 'error' : undefined}
                        variant="filled" 
                        sx={product.condition === 'used' ? {
                            bgcolor: '#616161', // Dark Grey
                            color: 'white',
                            fontWeight: 'bold'
                        } : {
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                <Typography variant="h6" color={isPromotedCard ? "error" : "primary"} sx={{ fontWeight: 'bold' }}>
                    {product.price.toLocaleString()} {product.currency || 'THB'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    <Typography variant="caption">{product.location}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                    <Tooltip title={levelAppearance.tooltip}>
                        <Box sx={{ position: 'relative', mr: 1.5 }}>
                            <Avatar
                                src={product.ownerInfo.avatarUrl}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    border: `2px solid ${levelAppearance.borderColor}`
                                }}
                            />
                            {levelAppearance.Icon && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: -2,
                                        right: -2,
                                        bgcolor: levelAppearance.bgColor,
                                        borderRadius: '50%',
                                        width: 16,
                                        height: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid white'
                                    }}
                                >
                                    <levelAppearance.Icon sx={{ fontSize: 12, color: 'white' }} />
                                </Box>
                            )}
                        </Box>
                    </Tooltip>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="body2" color="text.secondary" noWrap>{product.ownerInfo.name}</Typography>
                        {product.ownerInfo.level !== 'starter' && (
                            <Chip 
                                label={product.ownerInfo.level.toUpperCase()}
                                size="small"
                                sx={{
                                    bgcolor: levelAppearance.bgColor,
                                    color: product.ownerInfo.level === 'enterprise' ? 'black' : 'white', 
                                    height: '18px', 
                                    fontSize: '0.65rem', 
                                    fontWeight: 'bold',
                                    mt: 0.5
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ p: 1.5, pt: 0 }}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    color={isPromotedCard ? "error" : "primary"}
                    startIcon={<AddShoppingCartIcon />} 
                    sx={{ color: 'white' }}
                >
                    Add to Cart
                </Button>
            </CardActions>
        </Card>
    );
}



export default function LatestProductsPage() {
  const [promotedProducts, setPromotedProducts] = useState<Product[]>([]);
  const [generalProducts, setGeneralProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Keep this for title translation
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('All Latest Items');
  const { locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  // Fetch Categories (needed for page title translation)
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesQuery = query(collection(db, 'categories'));
            const querySnapshot = await getDocs(categoriesQuery);
            const categoriesData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id }) as Category);
            setCategories(categoriesData);
        } catch (err: any) {
            console.error("CLIENT ERROR: Failed to fetch categories:", err);
        }
    };
    fetchCategories();
  }, []);

  // Fetch Products (Promoted and General)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        // Base queries
        const baseQuery = collection(db, 'products');
        const publishedQuery = where('isPublished', '==', true);
        const orderedQuery = orderBy('createdAt', 'desc');

        // Promoted Query
        let promotedQ = query(
          baseQuery, 
          publishedQuery, 
          where('isPromoted', '==', true), 
          orderedQuery, 
          limit(6)
        );
        if (selectedCategory) {
          promotedQ = query(promotedQ, where('categoryId', '==', selectedCategory));
        }
        const promotedSnapshot = await getDocs(promotedQ);
        const promotedData = promotedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setPromotedProducts(promotedData);

        // General Query
        let generalQ = query(
          baseQuery, 
          publishedQuery, 
          where('isPromoted', '==', false), 
          orderedQuery, 
          limit(12)
        );
        if (selectedCategory) {
          generalQ = query(generalQ, where('categoryId', '==', selectedCategory));
        }
        const generalSnapshot = await getDocs(generalQ);
        const generalData = generalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setGeneralProducts(generalData);

      } catch (err: any) {
        console.error("CLIENT ERROR: Failed to fetch products: ", err);
        setError(`Failed to fetch products. Firestore error: ${err.message}`);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Update page title
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      let title = 'All Latest Items';
      let found = false;
      for (const cat of categories) {
        if (cat.id === selectedCategory) {
          title = cat.names[locale] || cat.names['en'];
          found = true;
          break;
        }
        if (cat.subCategories) {
          for (const sub of cat.subCategories) {
            if (sub.id === selectedCategory) {
              title = sub.names[locale] || sub.names['en'];
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      setPageTitle(title);
    } else {
      const allTitle: { [key: string]: string } = {
          th: 'สินค้าล่าสุดทั้งหมด',
          en: 'All Latest Items',
          ja: 'すべての最新アイテム',
          ko: '모든 최신 아이템',
          zh: '所有最新项目',
          hi: 'सभी नवीनतम आइटम'
      };
      setPageTitle(allTitle[locale] || allTitle['en']);
    }
  }, [selectedCategory, categories, locale]);

  if (error) {
    return <Typography color="error" align="center" sx={{ p: 4 }}>{error}</Typography>;
  }

    return (

      <Box sx={{ pb: 4 }}>

        {/* CategoryBar is now in AppLayout */}

        {loadingProducts ? (

           <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">

            <CircularProgress />

          </Box>

        ) : (

          <>

              {/* Only show promoted section if a category is NOT selected */}

              {!selectedCategory && promotedProducts.length > 0 && (

                  <Container maxWidth="xl" sx={{ my: 4 }}>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

                          <Typography variant="h4" component="h2" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '2.125rem' } }}>{t('Products.promotedItems')}</Typography>

                          <Button variant="outlined" sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{t('Products.viewAllPromoted')}</Button>

                      </Box>

                      <Grid container spacing={2}>

                          {promotedProducts.map(product => (

                              <Grid item key={product.id} xs={6} sm={4} md={3} lg={2}>

                                  <ProductCard product={product} isPromotedCard={true} />

                              </Grid>

                          ))}

                      </Grid>

                  </Container>

              )}

  

              {!selectedCategory && promotedProducts.length > 0 && (

                   <Divider sx={{ 
                     height: '3px', 
                     border: 'none',
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(to right, black, #FFD700 20%, #DAA520 50%, #FFD700 80%, black)'
                       : 'linear-gradient(to right, transparent, #DAA520 20%, #B8860B 50%, #DAA520 80%, transparent)'
                   }} />
              )}

  

              <Container maxWidth="xl" sx={{ my: 4 }}>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>

                       <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '2.125rem' } }}>

                          {pageTitle}

                      </Typography>

                      {/* Hide View All button when a category is selected */}

                      {!selectedCategory && <Button variant="outlined" sx={{ textTransform: 'none', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{t('Products.viewAll')}</Button>}

                  </Box>

                  <Grid container spacing={2}>

                      {generalProducts.map(product => (

                          <Grid item key={product.id} xs={6} sm={4} md={3} lg={2}>

                              <ProductCard product={product} />

                          </Grid>

                      ))}

                  </Grid>

              </Container>

          </>

        )}

       </Box>

    );
}