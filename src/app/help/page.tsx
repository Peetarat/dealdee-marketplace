'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import { Typography, Box } from '@mui/material';

export default function Page() {
  const { t } = useLanguage();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{t('Common.pageUnderConstruction')}</Typography>
    </Box>
  );
}
