'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface IPLLoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  inline?: boolean;
}

export default function IPLLoader({ size = 'medium', text = 'Loading...', inline = false }: IPLLoaderProps) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  if (inline) {
    return (
      <div className="flex items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses.small} rounded-full border-2 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent`}
        />
        {text && <span className="ml-2">{text}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} rounded-full border-t-4 border-b-4 border-blue-600`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="/ipl-logo-small.png" 
            alt="IPL Logo" 
            width={size === 'small' ? 20 : size === 'medium' ? 40 : 60} 
            height={size === 'small' ? 20 : size === 'medium' ? 40 : 60}
            className="object-contain"
          />
        </div>
      </div>
      {text && (
        <p className="mt-4 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}