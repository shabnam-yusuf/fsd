import React, { useState } from 'react';
import { User } from 'lucide-react';

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
  showInitial = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const dimension = sizeClasses[size] || sizeClasses.md;
  const iconDim = iconSizes[size] || iconSizes.md;

  const initial = name && typeof name === 'string' ? name.trim().charAt(0).toUpperCase() : '';

  // If user has uploaded a custom profile picture and it hasn't errored
  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'User Profile'}
        onError={() => setImageError(true)}
        className={`${dimension} rounded-full object-cover border border-slate-200 ${className}`}
      />
    );
  }

  // Neutral empty placeholder (no random photos, clean & neutral)
  return (
    <div
      className={`${dimension} rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold select-none flex-shrink-0 ${className}`}
      title={name || 'User'}
    >
      {showInitial && initial ? (
        <span>{initial}</span>
      ) : (
        <User className={`${iconDim} text-slate-400`} />
      )}
    </div>
  );
};

export default Avatar;
