'use client';

import { useState, useEffect } from 'react';
import algoliasearch from 'algoliasearch/lite';
import Link from 'next/link';
import { Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, CircularProgress, Container, Box, Paper } from '@mui/material';

const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY || ''
);
const index = searchClient.initIndex('dealdee_products');

interface Product {
  objectID: string; // Algolia uses objectID
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isSold: boolean;
  isPromoted: boolean;
  imageUrls: string[];
}

function ProductGrid({ products, loading, error }: { products: Product[], loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (products.length === 0) {
      return <Typography>No products found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {products.map(product => (
        <Grid item key={product.objectID} xs={12} sm={4} md={3} lg={2}>
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
  );
}

export default function ProductsPage() {
  const [promotedProducts, setPromotedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searches = [
          {
            indexName: 'dealdee_products',
            params: {
              filters: 'isPublished:true AND isPromoted:true AND stock > 0',
              hitsPerPage: 42,
              // Assuming sorting is handled by a replica index in Algolia if needed
            }
          },
          {
            indexName: 'dealdee_products', // or a replica index like 'dealdee_products_latest'
            params: {
              filters: 'isPublished:true AND isPromoted:false AND stock > 0',
              hitsPerPage: 42,
            }
          }
        ];

        const { results } = await searchClient.multipleQueries(searches);

        setPromotedProducts(results[0].hits as Product[]);
        setLatestProducts(results[1].hits as Product[]);

      } catch (err) {
        console.error("Error fetching products from Algolia: ", err);
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container sx={{ py: 4 }} maxWidth="xl">
      {/* Promoted Items Section */}
      <Box mb={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h2" fontWeight="bold">
            Promoted Items
          </Typography>
          <Link href="/products/promoted" passHref>
            <Button variant="outlined">See All</Button>
          </Link>
        </Box>
        <ProductGrid products={promotedProducts} loading={loading} error={error} />
      </Box>

      {/* Latest Items Section */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h2" fontWeight="bold">
            Latest Items
          </Typography>
          <Link href="/products/latest" passHref>
            <Button variant="outlined">See All</Button>
          </Link>
        </Box>
        <ProductGrid products={latestProducts} loading={loading} error={error} />
      </Box>
    </Container>
  );
}