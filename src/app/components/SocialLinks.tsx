''''use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TikTokIcon from '@mui/icons-material/MusicNote'; // MUI doesn't have a TikTok icon, using a placeholder
import LinkIcon from '@mui/icons-material/Link';

interface SocialLinksProps {
  links: { [key: string]: string };
}

const iconMap: { [key: string]: React.ElementType } = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

const SocialLinks: React.FC<SocialLinksProps> = ({ links = {} }) => {
  return (
    <Box>
      {Object.entries(links).map(([service, url]) => {
        if (!url) return null;
        const IconComponent = iconMap[service.toLowerCase()] || LinkIcon;
        return (
          <IconButton
            key={service}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${service} profile`}
          >
            <IconComponent />
          </IconButton>
        );
      })}
    </Box>
  );
};

export default SocialLinks;
''''