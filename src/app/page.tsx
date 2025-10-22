'use client';
import React from 'react';
import { useLanguage } from './components/LanguageProvider';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, Grid, Typography, Paper, Avatar, Link, IconButton, Divider, useTheme, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CottageIcon from '@mui/icons-material/Cottage';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';

import DemoChat from './components/DemoChat';

export default function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const imageUrls = {
    main1: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Main%201.png?alt=media&token=dff032a5-5d74-41c9-91af-7232e178ccb1",
    main2: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Main%202.png?alt=media&token=9f0dd0f7-ee49-46ac-a466-25bf374a8db4",
    main3: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Main%203.png?alt=media&token=d649d53e-11f6-4137-b3bc-8a38920e61a7",
    main4: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Main%204.png?alt=media&token=0ae6c3f3-7347-4561-b3d2-94c0f0e209e7"
  };

  const chatImageUrls = {
      man: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Man%20Chat%20Demo.png?alt=media&token=6c94cfe7-968e-4b50-8cc7-2e5efed78197",
      woman: "https://firebasestorage.googleapis.com/v0/b/dealdee-bf882.firebasestorage.app/o/Women%20Chat%20Demo.png?alt=media&token=8e881094-c1ad-4b6d-b083-81c7b34f9c0b"
  };

  return (
    <Box>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              {t('LandingPage.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
              {t('LandingPage.subtitle')}
            </Typography>
            <Button 
                variant="contained" 
                size="large" 
                onClick={() => router.push('/products/latest')}
                sx={{
                    borderRadius: '20px', 
                    px: 4, 
                    py: 1.5, 
                    color: 'white', 
                    fontWeight: 'bold', 
                    transition: 'all 0.3s ease', 
                    boxShadow: '0 4px 14px 0 rgba(0, 188, 212, 0.39)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                        '0%': {
                            boxShadow: '0 0 0 0 rgba(0, 188, 212, 0.4)'
                        },
                        '70%': {
                            boxShadow: '0 0 0 10px rgba(0, 188, 212, 0)'
                        },
                        '100%': {
                            boxShadow: '0 0 0 0 rgba(0, 188, 212, 0)'
                        }
                    },
                    '&:hover': { 
                        transform: 'translateY(-3px)', 
                        boxShadow: '0 8px 20px -4px rgba(0, 188, 212, 0.5)' 
                    } 
                }}
                endIcon={<ArrowForwardIcon sx={{ 
                    '@keyframes wiggle': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '50%': { transform: 'translateX(5px)' },
                    },
                    animation: 'wiggle 1.5s ease-in-out infinite' 
                }} />}
            >
              {t('LandingPage.browseButton')}
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            {isMobile ? (
                <Image src={imageUrls.main1} alt="DealDee Products" width={500} height={500} style={{width: '100%', height: 'auto', borderRadius: '16px'}} />
            ) : (
                <Paper elevation={6} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <Grid container>
                        <Grid item xs={12} sm={6} p={0.5}><Image src={imageUrls.main1} alt="iPhone" width={500} height={500} style={{width: '100%', height: 'auto', borderRadius: '16px', display: 'block'}} /></Grid>
                        <Grid item xs={12} sm={6} p={0.5}><Image src={imageUrls.main2} alt="Dress" width={500} height={500} style={{width: '100%', height: 'auto', borderRadius: '16px', display: 'block'}} /></Grid>
                        <Grid item xs={12} sm={6} p={0.5}><Image src={imageUrls.main3} alt="Bag" width={500} height={500} style={{width: '100%', height: 'auto', borderRadius: '16px', display: 'block'}} /></Grid>
                        <Grid item xs={12} sm={6} p={0.5}><Image src={imageUrls.main4} alt="Car" width={500} height={500} style={{width: '100%', height: 'auto', borderRadius: '16px', display: 'block'}} /></Grid>
                    </Grid>
                </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 6 }}>
            {t('LandingPage.howItWorksTitle')}
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', height: '100%' }}>
                    <EditNoteIcon color="primary" sx={{ fontSize: 56, mb: 2 }}/>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t('LandingPage.step1Title')}</Typography>
                    <Typography color="text.secondary">{t('LandingPage.step1Text')}</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', height: '100%' }}>
                    <ConnectWithoutContactIcon color="primary" sx={{ fontSize: 56, mb: 2 }}/>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t('LandingPage.step2Title')}</Typography>
                    <Typography color="text.secondary">{t('LandingPage.step2Text')}</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: '16px', height: '100%' }}>
                    <HandshakeIcon color="primary" sx={{ fontSize: 56, mb: 2 }}/>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t('LandingPage.step3Title')}</Typography>
                    <Typography color="text.secondary">{t('LandingPage.step3Text')}</Typography>
                </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* AI Translation / Demo Chat Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}><DemoChat manImageUrl={chatImageUrls.man} womanImageUrl={chatImageUrls.woman} /></Grid>
            <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#FFC107' }}>
                    <AutoAwesomeIcon sx={{ fontSize: '1.2rem', mr: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>AI Powered</Typography>
                </Box>
                <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mt: 1 }}>{t('LandingPage.aiFeatureTitle')}</Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>{t('LandingPage.aiFeatureText')}</Typography>
            </Grid>
        </Grid>
      </Container>

      {/* Popular Categories Section */}
      <Box sx={{ py: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 6 }}>
            {t('LandingPage.popularCategoriesTitle')}
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              { name: t('Categories.electronics'), icon: <PhoneIphoneIcon />, color: '#4285F4' },
              { name: t('Categories.fashion'), icon: <CheckroomIcon />, color: '#E91E63' },
              { name: t('Categories.hobbies'), icon: <EmojiEventsIcon />, color: '#9C27B0' },
              { name: t('Categories.home'), icon: <CottageIcon />, color: '#4CAF50' },
              { name: t('Categories.kids'), icon: <ChildFriendlyIcon />, color: '#FFC107' },
              { name: t('Categories.otop'), icon: <AutoAwesomeIcon />, color: '#FF5722' },
            ].map((category) => (
              <Grid item key={category.name} xs={6} sm={4} md={2}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                  <Avatar sx={{ bgcolor: category.color, width: 56, height: 56, mx: 'auto', mb: 1, color: 'white' }}>
                    {category.icon}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">{category.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: 4, textAlign: 'center', mx: -3, px: 3 }}>
        <Container maxWidth="md">
            <Typography variant="h4" component="h2" fontWeight="bold">{t('LandingPage.ctaTitle')}</Typography>
            <Typography sx={{ mt: 2, mb: 4, opacity: 0.8 }}>{t('LandingPage.ctaSubtitle')}</Typography>
            {/* App store buttons would go here */}
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', ml: 1 }}>
                    DealDee
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {t('Footer.tagline')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {t('Footer.copyright').replace('{year}', new Date().getFullYear().toString())}
                </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('Footer.about')}</Typography>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.aboutUs')}</Link>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.howToUse')}</Link>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.faq')}</Link>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.contactUs')}</Link>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('Footer.legal')}</Typography>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.terms')}</Link>
              <Link href="#" color="text.primary" underline="hover" display="block" mb={1}>{t('Footer.privacy')}</Link>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{t('Footer.followUs')}</Typography>
              <IconButton href="#" color="inherit" aria-label="Facebook"><FacebookIcon /></IconButton>
              <IconButton href="#" color="inherit" aria-label="Instagram"><InstagramIcon /></IconButton>
              <IconButton href="#" color="inherit" aria-label="Email"><EmailIcon /></IconButton>
            </Grid>
          </Grid>

        </Container>
      </Box>

    </Box>
  );
}
