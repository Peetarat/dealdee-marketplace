'use client';
import React from 'react';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Chat</h1>
      <p>Conversation ID: {params.conversationId}</p>
    </div>
  );
}
