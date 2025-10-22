'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ICategoryContext {
    selectedCategory: string | null;
    setSelectedCategory: (id: string | null) => void;
}

const CategoryContext = createContext<ICategoryContext | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
};
