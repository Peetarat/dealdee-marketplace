'use client';
import React from 'react';

export default function GroupPage({ params }: { params: { groupId: string } }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Group Details</h1>
      <p>Group ID: {params.groupId}</p>
    </div>
  );
}
