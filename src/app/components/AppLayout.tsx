'use client';

import '@fontsource/prompt/300.css';
import '@fontsource/prompt/400.css';
import '@fontsource/prompt/500.css';
import '@fontsource/prompt/700.css';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useLanguage } from './LanguageProvider';
import { useAppTheme } from './AppThemeProvider';
import LanguageSwitcher from './LanguageSwitcher';
import CategoryBar, { Category } from './CategoryBar'; // Import CategoryBar
import {
    AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge, Button, Menu, MenuItem, Divider, 
    useMediaQuery, useTheme, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, Fab, styled, Switch
} from '@mui/material';

// Import all necessary icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Added for Accordion
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // Added for Menu Group
import DashboardIcon from '@mui/icons-material/Dashboard'; // Added for Menu Group
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'; // Added for Accordion

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const { mode, toggleColorMode } = useAppTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);

    // --- Navigation Logic ---
    const backButtonExclusionPaths = ['/', '/products/latest', '/chat', '/notifications', '/account/my-profile'];
    const showBackButton = isMobile && !backButtonExclusionPaths.includes(pathname);

    // State for categories (moved from LatestProductsPage)
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        auth.signOut();
        handleMenuClose();
        setMobileDrawerOpen(false);
    };

    // Effect to handle user authentication state
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data());
                }
                // TODO: Add listeners for notifications and messages
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Effect to fetch categories (moved from LatestProductsPage)
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const categoriesQuery = query(collection(db, 'categories'));
                const querySnapshot = await getDocs(categoriesQuery);
                const categoriesData = querySnapshot.docs.map(doc => doc.data() as Category);
                setCategories(categoriesData);
            } catch (err: any) {
                console.error("CLIENT ERROR: Failed to fetch categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Effect to close mobile drawer on resize to desktop
    useEffect(() => {
        if (!isMobile) {
            setMobileDrawerOpen(false);
        }
    }, [isMobile]);

    // Workaround: Redirect from the placeholder page to the correct dynamic profile or login
    useEffect(() => {
        // We need to wait for the auth state to be determined
        const authCheckComplete = !!user || user === null;
        if (pathname === '/account/my-profile' && authCheckComplete) {
            if (user) {
                router.replace(`/profile/${user.uid}`);
            } else {
                router.replace('/login');
            }
        }
    }, [user, pathname, router]);

    const handleDrawerNavigation = (path: string) => {
        router.push(path);
        setMobileDrawerOpen(false);
    }

    const drawerContent = (
        <Box
            sx={{ width: 250, color: 'text.primary' }}
            role="presentation"
        >
            {user ? (
                <>
                    <List>
                        <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <Avatar src={userProfile?.photoURL} sx={{ width: 56, height: 56, mb: 1 }} />
                            <Typography variant="h6">{userProfile?.displayName || 'User'}</Typography>
                        </ListItem>
                    </List>
                    <Divider />

                    <Accordion elevation={0} sx={{ '&.Mui-expanded': { margin: 0 } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 2 }}>
                            <ListItemIcon sx={{ color: 'text.primary' }}><ManageAccountsIcon /></ListItemIcon>
                            <Typography>Account Management</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, backgroundColor: 'action.hover' }}>
                            <List component="div" disablePadding>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/my-profile')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><AccountCircleIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.profile')} />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/settings')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><SettingsIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.settings')} />
                                </ListItemButton>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion elevation={0} sx={{ '&.Mui-expanded': { margin: 0 } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 2 }}>
                            <ListItemIcon sx={{ color: 'text.primary' }}><DashboardIcon /></ListItemIcon>
                            <Typography>My Activity</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, backgroundColor: 'action.hover' }}>
                            <List component="div" disablePadding>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/products/add')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><AddCircleIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.sell')} />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/products')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><ListAltIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.myListings')} />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/orders')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><ReceiptIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.myOrders')} />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/cart')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><ShoppingCartIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.myCart')} />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleDrawerNavigation('/account/favorites')}>
                                    <ListItemIcon sx={{ color: 'text.primary' }}><FavoriteIcon /></ListItemIcon>
                                    <ListItemText primary={t('Header.menu.favorites')} />
                                </ListItemButton>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    
                    <Divider />

                    <List>
                        <ListItemButton onClick={() => handleDrawerNavigation('/chat')}>
                            <ListItemIcon sx={{ color: 'inherit' }}><ChatIcon /></ListItemIcon>
                            <ListItemText primary={t('Header.menu.messages')} />
                        </ListItemButton>
                        <ListItemButton onClick={() => handleDrawerNavigation('/notifications')}>
                            <ListItemIcon sx={{ color: 'inherit' }}><NotificationsIcon /></ListItemIcon>
                            <ListItemText primary={t('Header.menu.notifications')} />
                        </ListItemButton>
                    </List>

                    <Divider />

                    <List>
                        <ListItemButton onClick={() => handleDrawerNavigation('/help')}>
                            <ListItemIcon sx={{ color: 'inherit' }}><HelpIcon /></ListItemIcon>
                            <ListItemText primary={t('Header.menu.helpAndSupport')} />
                        </ListItemButton>
                        {/* TODO: Add admin check logic here */}
                        <ListItemButton onClick={() => handleDrawerNavigation('/admin')} >
                            <ListItemIcon sx={{ color: 'primary.main' }}><AdminPanelSettingsIcon /></ListItemIcon>
                            <ListItemText primary={t('Header.menu.admin')} sx={{ color: 'primary.main' }} />
                        </ListItemButton>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon sx={{ color: 'inherit' }}><ExitToAppIcon /></ListItemIcon>
                            <ListItemText primary={t('Header.menu.signOut')} />
                        </ListItemButton>
                    </List>
                </>
            ) : (
                <List>
                    <ListItemButton onClick={() => handleDrawerNavigation('/login')}><ListItemIcon sx={{ color: 'inherit' }}><LoginIcon /></ListItemIcon><ListItemText primary={t('Header.signIn')} /></ListItemButton>
                    <ListItemButton onClick={() => handleDrawerNavigation('/signup')}><ListItemIcon sx={{ color: 'inherit' }}><PersonAddIcon /></ListItemIcon><ListItemText primary={t('Header.signUp')} /></ListItemButton>
                </List>
            )}
            <Divider />
            <List>
                <ListItem onClick={(e) => e.stopPropagation()}>
                    <ListItemIcon sx={{ color: 'inherit' }}><LanguageIcon /></ListItemIcon>
                    <ListItemText primary={t('Drawer.language')} />
                    <LanguageSwitcher />
                </ListItem>
                <ListItem onClick={(e) => e.stopPropagation()}>
                    <ListItemIcon sx={{ color: 'inherit' }}>{mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}</ListItemIcon>
                    <ListItemText primary={t('Drawer.theme')} />
                    <Switch checked={mode === 'dark'} onChange={toggleColorMode} />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <AppBar 
                position="fixed" 
                elevation={0}
                sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {isMobile ? (
                        <>
                            {/* Left: Back button or empty space */}
                            <Box sx={{ minWidth: '48px' }}>
                                {showBackButton && (
                                <IconButton color="inherit" onClick={() => router.back()}>
                                    <ArrowBackIcon />
                                </IconButton>
                                )}
                            </Box>

                            {/* Center: Logo */}
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
                                <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    DealDee
                                </Typography>
                            </Box>

                            {/* Right: Hamburger */}
                            <Box sx={{ minWidth: '48px', display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton color="inherit" onClick={() => setMobileDrawerOpen(true)}>
                                <MenuIcon />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }} onClick={() => router.push('/')}>
                                <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    DealDee
                                </Typography>
                            </Box>
                            <LanguageSwitcher /> 
                            {user ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                    <IconButton onClick={() => router.push('/chat')} color="inherit"><Badge badgeContent={unreadMsgCount} color="error"><ChatIcon /></Badge></IconButton>
                                    <IconButton onClick={() => router.push('/notifications')} color="inherit"><Badge badgeContent={unreadNotifCount} color="error"><NotificationsIcon /></Badge></IconButton>
                                    <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1.5 }}>
                                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                    </IconButton>
                                    <IconButton onClick={handleAvatarClick}>
                                        <Avatar src={userProfile?.photoURL} sx={{ width: 32, height: 32 }} />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        onClick={handleMenuClose}
                                        PaperProps={{
                                            elevation: 0,
                                            sx: {
                                                overflow: 'visible',
                                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                mt: 1.5,
                                                '& .MuiAvatar-root': {
                                                    width: 32,
                                                    height: 32,
                                                    ml: -0.5,
                                                    mr: 1,
                                                },
                                                '&:before': {
                                                    content: '""',
                                                    display: 'block',
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 14,
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: 'background.paper',
                                                    transform: 'translateY(-50%) rotate(45deg)',
                                                    zIndex: 0,
                                                },
                                            },
                                        }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <Box sx={{ pl: 2, pr: 4, py: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Account Management</Typography>
                                        </Box>
                                        <MenuItem onClick={() => router.push('/account/my-profile')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <AccountCircleIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.profile')}
                                        </MenuItem>
                                        <MenuItem onClick={() => router.push('/account/settings')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <SettingsIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.settings')}
                                        </MenuItem>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ pl: 2, pr: 4, py: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">My Activity</Typography>
                                        </Box>
                                        <MenuItem onClick={() => router.push('/account/products/add')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <AddCircleIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.sell')}
                                        </MenuItem>
                                        <MenuItem onClick={() => router.push('/account/products')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <ListAltIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.myListings')}
                                        </MenuItem>
                                        <MenuItem onClick={() => router.push('/account/orders')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <ReceiptIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.myOrders')}
                                        </MenuItem>
                                        <MenuItem onClick={() => router.push('/cart')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <ShoppingCartIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.myCart')}
                                        </MenuItem>
                                        <MenuItem onClick={() => router.push('/account/favorites')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <FavoriteIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.favorites')}
                                        </MenuItem>
                                        <Divider sx={{ my: 1 }} />
                                        <MenuItem onClick={() => router.push('/help')}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <HelpIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.helpAndSupport')}
                                        </MenuItem>
                                        {/* TODO: Add admin check logic here */}
                                        <MenuItem onClick={() => router.push('/admin')} sx={{ color: 'primary.main' }}>
                                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                                <AdminPanelSettingsIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.admin')}
                                        </MenuItem>
                                        <Divider sx={{ my: 1 }} />
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon sx={{ color: 'text.primary' }}>
                                                <ExitToAppIcon fontSize="small" />
                                            </ListItemIcon>
                                            {t('Header.menu.signOut')}
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            ) : (
                                <Box sx={{ ml: 2 }}>
                                    <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 4.5 }}>
                                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                    </IconButton>
                                    <Button variant={pathname === '/signup' ? 'contained' : 'outlined'} color="primary" onClick={() => router.push('/signup')} sx={{ mr: 1 }}>{t('Header.signUp')}</Button>
                                    <Button variant={pathname === '/login' ? 'contained' : 'outlined'} color="primary" onClick={() => router.push('/login')}>{t('Header.signIn')}</Button>
                                </Box>
                            )}
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
                {drawerContent}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: isMobile ? 1 : 3, mt: '64px', display: 'flex', flexDirection: 'column' }}>
                {pathname.startsWith('/products/latest') && <CategoryBar 
                    categories={categories}
                    loading={loadingCategories}
                    onCategorySelect={(categoryId: string | null) => {
                        const newPath = categoryId ? `/products/latest?category=${categoryId}` : '/products/latest';
                        router.push(newPath);
                    }}
                    selectedCategoryId={searchParams.get('category')}
                    mode={mode}
                />}
                <Box sx={{ flexGrow: 1, pb: isMobile ? '56px' : 0}}>
                    {children}
                </Box>
            </Box>

            {isMobile && user && (
                <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0, background: 'background.paper' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 6 }}>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <IconButton color={pathname === '/products/latest' ? "primary" : "inherit"} onClick={() => router.push('/products/latest')}><HomeIcon /></IconButton>
                            <IconButton color={pathname.startsWith('/chat') ? "primary" : "inherit"} onClick={() => router.push('/chat')}><Badge badgeContent={unreadMsgCount} color="error"><ChatIcon /></Badge></IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <IconButton color={pathname.startsWith('/notifications') ? "primary" : "inherit"} onClick={() => router.push('/notifications')}><Badge badgeContent={unreadNotifCount} color="error"><NotificationsIcon /></Badge></IconButton>
                            <IconButton color={pathname.startsWith('/account') ? "primary" : "inherit"} onClick={() => router.push('/account/my-profile')}><AccountCircleIcon /></IconButton>
                        </Box>
                    </Toolbar>
                    <StyledFab 
                        aria-label="add"
                        onClick={() => router.push('/account/products/add')}
                        sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#fb8c00' } }}
                    >
                        <AddCircleIcon sx={{ color: 'white' }} />
                    </StyledFab>
                </AppBar>
            )}
        </Box>
    );
}