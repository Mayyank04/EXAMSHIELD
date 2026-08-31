import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight: React.FC<SpotlightProps> = ({ className, fill = '#00D9FF' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className={cn('pointer-events-none absolute -top-40 left-0 z-0 h-[180%] w-[180%] select-none', className)}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 3787 2842"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#spotlight-filter)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
            fill={fill}
            fillOpacity="0.21"
          />
        </g>
        <defs>
          <filter
            id="spotlight-filter"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
};
