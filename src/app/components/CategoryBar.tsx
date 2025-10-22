'use client';

import React, { useState } from 'react';
import { iconMap } from './IconMap';
import { Box, Grid, Typography, Paper, Popover, Menu, MenuItem, useMediaQuery, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useLanguage } from './LanguageProvider';
import { useAppTheme } from './AppThemeProvider';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Interfaces are exported so parent components can use them
export interface SubCategory {
  id: string;
  names: { [key: string]: string };
}

export interface Category {
  id: string;
  names: { [key: string]: string };
  icon: string; // Icon name as a string
  subCategories?: SubCategory[];
}

const CategoryItem = ({ category, onCategoryClick, isSelected, locale }: { 
    category: Category, 
    onCategoryClick: (event: React.MouseEvent<HTMLElement>, category: Category) => void,
    isSelected: boolean,
    locale: string,
}) => {
    const IconComponent = iconMap[category.icon] || HelpOutlineIcon; // Fallback to a default icon

    return (
        <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={(e) => onCategoryClick(e, category)}>
            <Paper elevation={isSelected ? 6 : 2} sx={{
                width: 80, 
                height: 80, 
                borderRadius: '25px', // Squircle shape
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mx: 'auto', 
                mb: 1,
                transition: 'transform 0.2s, background-color 0.2s',
                backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                '&:hover': { transform: 'scale(1.05)', backgroundColor: isSelected ? 'primary.light' : 'grey.100' }
            }}>
                <IconComponent sx={{ fontSize: 40, color: isSelected ? 'white' : 'primary.main' }} />
            </Paper>
            <Typography variant="caption" sx={{ display: 'block', width: 85, mx: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isSelected ? 'bold' : 'normal' }}>
                {category.names[locale] || category.names['en']}
            </Typography>
        </Box>
    );
};

export default function CategoryBar({
    categories,
    loading,
    onCategorySelect, 
    selectedCategoryId,
    mode // Receive mode as a prop
}: {
    categories: Category[],
    loading: boolean,
    onCategorySelect: (id: string | null) => void, 
    selectedCategoryId: string | null,
    mode: string 
}) {
    const theme = useTheme();
    const { locale, t } = useLanguage();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
    const [dropdownAnchorEl, setDropdownAnchorEl] = useState<HTMLElement | null>(null);
    const [dropdownCategory, setDropdownCategory] = useState<Category | null>(null);

    const allCategory: Category = {
        id: 'all',
        names: { th: 'ทั้งหมด', en: 'All', ja: 'すべて', ko: '전체', zh: '全部', hi: 'सब' },
        icon: 'AllInclusiveIcon' // Use the string name
    };
    const allCategories = [allCategory, ...categories];

    const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
        setMoreAnchorEl(event.currentTarget);
    };

    const handleMoreClose = () => {
        setMoreAnchorEl(null);
    };

    const handleCategoryClick = (event: React.MouseEvent<HTMLElement>, category: Category) => {
        if (category.id === 'all') {
            onCategorySelect(null);
            return;
        }

        if (category.subCategories && category.subCategories.length > 0) {
            setDropdownCategory(category);
            setDropdownAnchorEl(event.currentTarget);
        } else {
            onCategorySelect(category.id);
        }
    };

    const handleDropdownClose = () => {
        setDropdownAnchorEl(null);
        setDropdownCategory(null);
    };

    const handleSubCategoryClick = (subCategory: SubCategory) => {
        onCategorySelect(subCategory.id);
        handleDropdownClose();
    };

    const openMore = Boolean(moreAnchorEl);
    const openDropdown = Boolean(dropdownAnchorEl);

    const visibleCount = isMobile ? 3 : (isTablet ? 7 : 11);
    const visibleCategories = allCategories.slice(0, visibleCount);
    const hiddenCategories = allCategories.slice(visibleCount);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 2 }}>
                {Array.from(new Array(isMobile ? 4 : 8)).map((_, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                        <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: '25px', mb: 1, mx: 'auto' }} />
                        <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2, py: 2, flexWrap: 'wrap' }}>
            {visibleCategories.map(cat => (
                <CategoryItem
                    key={cat.id}
                    category={cat}
                    onCategoryClick={handleCategoryClick}
                    isSelected={selectedCategoryId === cat.id || (cat.subCategories?.some(sub => sub.id === selectedCategoryId) ?? false)}
                    locale={locale}
                />
            ))}

            {hiddenCategories.length > 0 && (
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleMoreClick}>
                    <Paper 
                        elevation={2} 
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1,
                            transition: 'transform 0.2s, background-color 0.2s',
                            backgroundColor: mode === 'dark' ? 'primary.dark' : 'grey.100',
                            '&:hover': { 
                                transform: 'scale(1.05)', 
                                backgroundColor: mode === 'dark' ? 'primary.main' : 'grey.200' 
                            }
                        }}
                    >
                        <MoreHorizIcon sx={{ fontSize: 40, color: mode === 'dark' ? 'white' : 'text.secondary' }} />
                    </Paper>
                    <Typography variant="caption" sx={{ display: 'block', width: 85, mx: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t('Categories.more')}
                    </Typography>
                </Box>
            )}

            <Popover
                open={openMore}
                anchorEl={moreAnchorEl}
                onClose={handleMoreClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Grid container spacing={2} sx={{ p: 2, maxWidth: 400 }}>
                    {hiddenCategories.map(cat => (
                        <Grid item xs={4} key={cat.id}>
                            <CategoryItem
                                category={cat}
                                onCategoryClick={handleCategoryClick}
                                isSelected={selectedCategoryId === cat.id || (cat.subCategories?.some(sub => sub.id === selectedCategoryId) ?? false)}
                                locale={locale}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Popover>

            <Menu
                anchorEl={dropdownAnchorEl}
                open={openDropdown}
                onClose={handleDropdownClose}
            >
                {dropdownCategory?.subCategories?.map(sub => (
                    <MenuItem key={sub.id} onClick={() => handleSubCategoryClick(sub)} selected={selectedCategoryId === sub.id}>
                        {sub.names[locale] || sub.names['en']}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}