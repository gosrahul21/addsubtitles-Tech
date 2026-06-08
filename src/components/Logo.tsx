import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-md',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const paddingSizes = {
    sm: 'p-1.5',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`bg-gradient-to-tr from-amber-400 to-amber-600 ${paddingSizes[size]} rounded-md shadow-md shadow-amber-500/10`}>
        <svg className={`${iconSizes[size]} text-[#0d142d]`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 22h20L12 2zm0 4.8L18.4 19H5.6L12 6.8z" />
        </svg>
      </div>
      <span className={`${textSizes[size]} font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-heading`}>
        Add<span className="text-amber-400 font-semibold">Subtitles</span>
      </span>
    </div>
  );
}
