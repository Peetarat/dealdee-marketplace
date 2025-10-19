'use client';
import React from 'react';

export default function PlatformOrderPage({ params }: { params: { platformOrderId: string } }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Platform Order Details</h1>
      <p>Platform Order ID: {params.platformOrderId}</p>
    </div>
  );
}
