import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'calendar' | 'chart';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  count = 12 
}) => {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse w-3/4" />
        <div className="flex gap-4 mt-4">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-16" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-20" />
        </div>
        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mt-4" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-2/3" />
            </div>
            <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendarSkeleton = () => (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="mb-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse w-64" />
      </div>
      <div className="grid grid-cols-8 gap-4">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  const renderChartSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="mb-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-48" />
      </div>
      <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse" />
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'card':
        return (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: count }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {renderCardSkeleton()}
              </motion.div>
            ))}
          </motion.div>
        );
      
      case 'list':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderListSkeleton()}
          </motion.div>
        );
      
      case 'calendar':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {renderCalendarSkeleton()}
          </motion.div>
        );
      
      case 'chart':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {renderChartSkeleton()}
              </motion.div>
            ))}
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}; 