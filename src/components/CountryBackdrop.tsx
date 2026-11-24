import React from 'react';
import { TileConfig } from '../types/game';

interface CountryBackdropProps {
  tile: TileConfig;
}

const COUNTRY_PALETTES: Record<string, { from: string; to: string; silhouette: string }> = {
  inggris: { from: '#1e3a8a', to: '#3b82f6', silhouette: '#0f172a' },
  jerman: { from: '#374151', to: '#b45309', silhouette: '#111827' },
  prancis: { from: '#1d4ed8', to: '#be123c', silhouette: '#0f172a' },
  jepang: { from: '#0f172a', to: '#db2777', silhouette: '#1e1b4b' },
  tiongkok: { from: '#991b1b', to: '#d97706', silhouette: '#450a0a' },
  korea_selatan: { from: '#1e40af', to: '#0891b2', silhouette: '#0f172a' },
  amerika_serikat: { from: '#0f172a', to: '#0284c7', silhouette: '#1e293b' },
  kanada: { from: '#991b1b', to: '#0f766e', silhouette: '#064e3b' },
  brasil: { from: '#15803d', to: '#ca8a04', silhouette: '#052e16' },
  afrika_selatan: { from: '#9a3412', to: '#0284c7', silhouette: '#431407' },
  kenya: { from: '#92400e', to: '#ea580c', silhouette: '#451a03' },
  australia: { from: '#0369a1', to: '#0ea5e9', silhouette: '#0c4a6e' },
};

export const CountryBackdrop: React.FC<CountryBackdropProps> = ({ tile }) => {
  const pal = COUNTRY_PALETTES[tile.id] || {
    from: '#0f172a',
    to: '#0284c7',
    silhouette: '#020617',
  };

  const renderSkyline = () => {
    switch (tile.id) {
      case 'inggris':
        return (
          <path
            d="M0 90 L30 90 L30 62 L55 62 L55 90 L80 90 L80 42 L86 24 L92 42 L92 90 L110 90 L110 70 L160 70 L160 90 L220 90 L220 55 L250 55 L250 90 L400 90 L400 100 L0 100 Z"
            fill={pal.silhouette}
            opacity="0.7"
          />
        );
      case 'prancis':
        return (
          <path
            d="M0 90 L60 90 L76 62 L84 36 L88 12 L92 36 L100 62 L116 90 L160 90 L160 72 L220 72 L220 90 L400 90 L400 100 L0 100 Z"
            fill={pal.silhouette}
            opacity="0.72"
          />
        );
      case 'jepang':
        return (
          <>
            <circle cx="310" cy="36" r="18" fill="#fef08a" opacity="0.45" />
            <path
              d="M0 90 L80 90 L150 38 L175 38 L245 90 L400 90 L400 100 L0 100 Z"
              fill={pal.silhouette}
              opacity="0.72"
            />
            <path d="M148 39 L177 39 L169 50 L156 50 Z" fill="#f8fafc" opacity="0.65" />
          </>
        );
      case 'amerika_serikat':
        return (
          <path
            d="M0 90 L35 90 L35 55 L52 55 L52 90 L70 90 L70 40 L84 40 L84 90 L112 90 L112 22 L120 22 L120 90 L145 90 L145 50 L168 50 L168 90 L400 90 L400 100 L0 100 Z"
            fill={pal.silhouette}
            opacity="0.7"
          />
        );
      case 'australia':
        return (
          <path
            d="M0 90 L45 90 Q65 45 90 90 Q112 32 140 90 Q160 52 182 90 L400 90 L400 100 L0 100 Z"
            fill="#f8fafc"
            opacity="0.32"
          />
        );
      default:
        return (
          <path
            d="M0 90 L55 72 L110 86 L175 56 L235 84 L305 64 L365 82 L400 76 L400 100 L0 100 Z"
            fill={pal.silhouette}
            opacity="0.6"
          />
        );
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        background: `linear-gradient(125deg, ${pal.from} 0%, ${pal.to} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="w-full h-full opacity-90"
        aria-hidden="true"
      >
        {renderSkyline()}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-slate-950/75" />
    </div>
  );
};
