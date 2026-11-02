'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { recordPageView, formatViews } from '@/lib/viewsService';

interface ViewCounterProps {
  entityType: 'tool' | 'blog';
  slug: string;
  initialViews?: number;
  className?: string;
  showIcon?: boolean;
}

export default function ViewCounter({
  entityType,
  slug,
  initialViews,
  className = '',
  showIcon = true,
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(initialViews ?? null);

  useEffect(() => {
    let isMounted = true;
    recordPageView(entityType, slug).then((count) => {
      if (isMounted && count !== null) {
        setViews(count);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [entityType, slug]);

  if (views === null && initialViews === undefined) {
    return null;
  }

  const displayCount = views !== null ? views : initialViews || 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-sm ${className}`}
      title={`${displayCount} views`}
    >
      {showIcon && <Eye className="w-3.5 h-3.5 text-amber-400" />}
      <span>{formatViews(displayCount)} views</span>
    </span>
  );
}
