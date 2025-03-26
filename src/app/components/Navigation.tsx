'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Dream11 Rankings
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/matches" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/matches') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    Matches
                  </Link>
                  
                  <Link 
                    href="/leaderboard" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/leaderboard') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    Leaderboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/') && pathname === '/' ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'loading' ? (
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.name}
                </span>
                <Link 
                  href="/api/auth/signout"
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Sign out
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link 
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden hidden">
        <div className="pt-2 pb-3 space-y-1">
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/dashboard') ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/matches" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/matches') ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                Matches
              </Link>
              
              <Link 
                href="/leaderboard" 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/leaderboard') ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                Leaderboard
              </Link>
            </>
          ) : (
            <Link 
              href="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/') && pathname === '/' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Home
            </Link>
          )}
        </div>
        
        {session && (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {session.user.name?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{session.user.name}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link 
                href="/api/auth/signout"
                className="block px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}