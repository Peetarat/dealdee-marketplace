'use client';
import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from './LanguageProvider';

const LanguageSwitcher = () => {
    const { locale, setLocale } = useLanguage();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isClient, setIsClient] = useState(false);
    const open = Boolean(anchorEl);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSwitch = (newLocale: string) => {
        setLocale(newLocale);
        handleClose();
    };

    const locales = [{code: 'en', name: 'English'}, {code: 'th', name: 'ไทย'}, {code: 'zh', name: '中文'}, {code: 'ja', name: '日本語'}, {code: 'ko', name: '한국어'}, {code: 'hi', name: 'हिन्दी'}];

    return (
        <div>
            {isClient ? (
                <Button
                    id="language-button"
                    onClick={handleClick}
                    color="inherit"
                    startIcon={<LanguageIcon />}
                >
                    {locale.toUpperCase()}
                </Button>
            ) : (
                // Render a placeholder on the server and initial client render
                <Button
                    id="language-button"
                    color="inherit"
                    startIcon={<LanguageIcon />}
                    disabled
                >
                    EN
                </Button>
            )}
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {locales.map((loc) => (
                    <MenuItem key={loc.code} onClick={() => handleSwitch(loc.code)} selected={loc.code === locale}>
                        {loc.name}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default LanguageSwitcher;