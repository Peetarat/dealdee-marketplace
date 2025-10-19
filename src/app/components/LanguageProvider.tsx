'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Define the shape of the context
interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// The provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<any>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'en' : 'en';
      
      try {
        const loadedMessages = await import(`../../../messages/${savedLocale}.json`);
        setMessages(loadedMessages.default);
        setLocale(savedLocale);
      } catch (error) {
        console.error(`Could not load messages for locale: ${savedLocale}`, error);
        // Fallback to English if loading fails
        try {
          const fallbackMessages = await import('../../../messages/en.json');
          setMessages(fallbackMessages.default);
          setLocale('en');
        } catch (fallbackError) {
          console.error('Could not load fallback messages (en.json)', fallbackError);
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const handleSetLocale = (newLocale: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }

    const loadMessages = async () => {
      try {
        const loadedMessages = await import(`../../../messages/${newLocale}.json`);
        setMessages(loadedMessages.default);
        setLocale(newLocale);
      } catch (error) {
        console.error(`Could not load messages for locale: ${newLocale}`, error);
      }
    };
    
    loadMessages();
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result = messages;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }
    return typeof result === 'string' ? result : key;
  }, [messages]);

  const value = {
    locale,
    setLocale: handleSetLocale,
    t,
  };

  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}