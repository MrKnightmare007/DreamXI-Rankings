'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-[var(--ipl-blue)] to-[#003366] text-white shadow-lg mb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-white flex items-center">
                <motion.span 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-[var(--ipl-orange)] mr-1"
                >
                  Dream11
                </motion.span>
                <span>Rankings</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard') ? 'border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/matches" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/matches') ? 'border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
                  >
                    Matches
                  </Link>
                  
                  <Link 
                    href="/leaderboard" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/leaderboard') ? 'border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
                  >
                    Leaderboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/') && pathname === '/' ? 'border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'}`}
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'loading' ? (
              <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[var(--ipl-orange)]/20 hover:bg-[var(--ipl-orange)]/30 transition-colors"
                >
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-6 h-6 rounded-full border border-[var(--ipl-orange)]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[var(--ipl-orange)] flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {session.user.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {session.user.name}
                  </span>
                </Link>
                <Link 
                  href="/api/auth/signout"
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Sign out
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Sign in
                </Link>
                <Link 
                  href="/register"
                  className="text-sm bg-[var(--ipl-orange)] text-white px-3 py-1.5 rounded-md hover:bg-[var(--ipl-orange)]/90 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[var(--ipl-blue)]/50 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <motion.div 
        className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="pt-2 pb-3 space-y-1">
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/dashboard') ? 'bg-[var(--ipl-blue)]/30 border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:bg-[var(--ipl-blue)]/20 hover:border-gray-300'}`}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/matches" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/matches') ? 'bg-[var(--ipl-blue)]/30 border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:bg-[var(--ipl-blue)]/20 hover:border-gray-300'}`}
              >
                Matches
              </Link>
              
              <Link 
                href="/leaderboard" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/leaderboard') ? 'bg-[var(--ipl-blue)]/30 border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:bg-[var(--ipl-blue)]/20 hover:border-gray-300'}`}
              >
                Leaderboard
              </Link>
            </>
          ) : (
            <Link 
              href="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/') && pathname === '/' ? 'bg-[var(--ipl-blue)]/30 border-[var(--ipl-orange)] text-white' : 'border-transparent text-gray-300 hover:bg-[var(--ipl-blue)]/20 hover:border-gray-300'}`}
            >
              Home
            </Link>
          )}
        </div>
        
        {session && (
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[var(--ipl-orange)] flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {session.user.name?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{session.user.name}</div>
                <div className="text-sm font-medium text-gray-400">{session.user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link 
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[var(--ipl-blue)]/20"
              >
                Profile
              </Link>
              <Link 
                href="/api/auth/signout"
                className="block px-4 py-2 text-base font-medium text-red-400 hover:bg-[var(--ipl-blue)]/20"
              >
                Sign out
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </motion.nav>
  );
}