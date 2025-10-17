'''use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isSold: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products: ", err);
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', position: 'relative' }}>
            {product.isSold && <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>SOLD</div>}
            {(product.stock <= 0 && !product.isSold) && <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>OUT OF STOCK</div>}
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><b>Price:</b> ${product.price}</p>
            <p><b>Stock:</b> {product.stock}</p>
            <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
'''