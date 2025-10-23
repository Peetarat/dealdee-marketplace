''''use client';

import React from 'react';
import { Avatar, Badge, Box, styled } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ShieldIcon from '@mui/icons-material/Shield';

// Define the structure for tier-specific styles
interface TierStyle {
  borderColor: string;
  icon: SvgIconComponent;
  iconColor: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

// Map tiers to their respective styles
const tierStyles: { [key: string]: TierStyle } = {
  standard: {
    borderColor: '#4caf50', // Green
    icon: StarIcon,
    iconColor: 'success',
  },
  premium: {
    borderColor: '#ffd700', // Gold
    icon: WorkspacePremiumIcon,
    iconColor: 'warning',
  },
  admin: {
    borderColor: '#2196f3', // Blue
    icon: ShieldIcon,
    iconColor: 'primary',
  },
};

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '2px',
  },
}));

interface TieredAvatarProps {
  src?: string | null;
  alt?: string;
  tier: string;
  size?: number;
}

const TieredAvatar: React.FC<TieredAvatarProps> = ({ src, alt, tier, size = 100 }) => {
  const style = tierStyles[tier] || { borderColor: '#9e9e9e', icon: () => null, iconColor: 'inherit' };
  const IconComponent = style.icon;

  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent color={style.iconColor} sx={{ fontSize: 20 }} />
        </Box>
      }
    >
      <Avatar
        src={src || ''}
        alt={alt || 'User Avatar'}
        sx={{
          width: size,
          height: size,
          border: `3px solid ${style.borderColor}`,
        }}
      />
    </StyledBadge>
  );
};

export default TieredAvatar;
''''