import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="animate-spin text-teal-500" size={size} />
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-navy-700 rounded-lg ${className}`}></div>
);

export const CardSkeleton = () => (
    <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
            </div>
        </div>
    </div>
);
