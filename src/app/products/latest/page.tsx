'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, CircularProgress, Container, Box } from '@mui/material';
import Link from 'next/link';

// This should be a shared interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
}

export default function LatestProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'), 
          where('isPublished', '==', true), 
          where('isPromoted', '==', false),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching latest products: ", err);
        setError('Failed to fetch latest products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return <Typography color="error" align="center" sx={{ p: 4 }}>{error}</Typography>;
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="xl">
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        All Latest Items
      </Typography>
      <Grid container spacing={2}>
        {products.map(product => (
          <Grid item key={product.id} xs={12} sm={4} md={3} lg={2}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/150'}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${product.price}
                </Typography>
              </CardContent>
              <CardActions>
                <Link href={`/products/${product.id}`} passHref>
                  <Button size="small">View</Button>
                </Link>
                <Button size="small">Add to Cart</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
