import Link from 'next/link';
import Image from 'next/image';
import { getAuthSession } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if user is logged in
  const session = await getAuthSession();
  
  // If user is logged in, redirect to dashboard
  if (session?.user) {
    // If user is admin, redirect to admin page (keeping your existing admin redirect logic)
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      // For regular users, redirect to dashboard
      redirect('/dashboard');
    }
  }
  
  // Continue with the regular home page for non-logged in users
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Dream11 Performance</h1>
          <p className="text-xl mb-6">Compare your fantasy cricket skills with friends and climb the leaderboard!</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/login" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-full transition-all transform hover:scale-105"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-full transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
            <p className="text-gray-600 dark:text-gray-300">Sign up with your Dream11 username to start tracking your performance</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enter Match Results</h3>
            <p className="text-gray-600 dark:text-gray-300">Record your Dream11 points after each IPL match</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-300">See your ranking and compare with friends on the leaderboard</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 my-8">
        <h2 className="text-3xl font-bold text-center mb-8">IPL 2025 Season</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-300 text-sm">Total Matches</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">74</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-300 text-sm">Teams</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">10</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-300 text-sm">Active Users</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-300 text-sm">Avg Points/Match</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">0</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to start tracking?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">Join our community of fantasy cricket enthusiasts and see how your Dream11 skills compare!</p>
        <Link 
          href="/register" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-block"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
