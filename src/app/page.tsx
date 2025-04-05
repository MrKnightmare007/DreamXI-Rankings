// First, add this import at the top
"use client";

import { redirect } from 'next/navigation';
import { getAuthSession } from '../lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import IPLLoader from '@/components/IPLLoader';

// Define types for better type safety
interface Team {
  name: string;
  fullName: string;
  bgColor: string;
  textColor: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export default async function Home() {
  let session;
  
  try {
    // Check if user is logged in
    session = await getAuthSession();
    
    // If user is logged in, redirect to appropriate page
    if (session?.user) {
      if (session.user.role === 'ADMIN') {
        redirect('/admin');
      } else {
        redirect('/dashboard');
      }
    }
  } catch (error) {
    console.error('Auth session error:', error);
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Teams data
  const teams: Team[] = [
    { name: 'CSK', fullName: 'Chennai Super Kings', bgColor: 'bg-yellow-400', textColor: 'text-black' },
    { name: 'MI', fullName: 'Mumbai Indians', bgColor: 'bg-blue-600', textColor: 'text-white' },
    { name: 'RCB', fullName: 'Royal Challengers Bangalore', bgColor: 'bg-red-600', textColor: 'text-white' },
    { name: 'KKR', fullName: 'Kolkata Knight Riders', bgColor: 'bg-purple-800', textColor: 'text-white' },
    { name: 'DC', fullName: 'Delhi Capitals', bgColor: 'bg-blue-500', textColor: 'text-white' },
    { name: 'SRH', fullName: 'Sunrisers Hyderabad', bgColor: 'bg-orange-500', textColor: 'text-black' },
    { name: 'PBKS', fullName: 'Punjab Kings', bgColor: 'bg-red-500', textColor: 'text-white' },
    { name: 'RR', fullName: 'Rajasthan Royals', bgColor: 'bg-pink-600', textColor: 'text-white' },
    { name: 'GT', fullName: 'Gujarat Titans', bgColor: 'bg-blue-700', textColor: 'text-white' },
    { name: 'LSG', fullName: 'Lucknow Super Giants', bgColor: 'bg-teal-500', textColor: 'text-white' }
  ];

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Rahul Sharma",
      role: "Fantasy Cricket Enthusiast",
      quote: "Dream11 Rankings has completely changed how I track my fantasy cricket performance. Now I can see how I stack up against friends!"
    },
    {
      name: "Priya Patel",
      role: "IPL Fan",
      quote: "The live match tracking feature is amazing. I can see my Dream11 points updating in real-time as the match progresses."
    },
    {
      name: "Vikram Singh",
      role: "Cricket Analyst",
      quote: "The detailed statistics help me improve my Dream11 strategy. I've seen my ranking climb steadily since I started using this platform."
    }
  ];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <IPLLoader size="large" text="Loading Dream11 Rankings..." />
      </div>
    }>
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl p-8 shadow-lg overflow-hidden relative">
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: 'url(/ipl-pattern.jpg)',
              backgroundSize: '300px',
              backgroundRepeat: 'repeat'
            }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Dream11 Performance</h1>
            <p className="text-xl mb-6">Compare your fantasy cricket skills with friends and climb the leaderboard!</p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all inline-block"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div variants={item}>
                <Link 
                  href="/register" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-full transition-all inline-block"
                >
                  Create Account
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="py-8"
        >
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
            >
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">Sign up with your Dream11 username to start tracking your performance</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
            >
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Match Results</h3>
              <p className="text-gray-600 dark:text-gray-300">Record your Dream11 points after each IPL match</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
            >
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300">See your ranking and compare with friends on the leaderboard</p>
            </motion.div>
          </div>
        </motion.section>

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

        {/* Upcoming Matches Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="py-8 px-4"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Upcoming Matches</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { home: 'CSK', away: 'MI', date: 'Mar 22, 2025', time: '7:30 PM', venue: 'M.A. Chidambaram Stadium' },
              { home: 'RCB', away: 'KKR', date: 'Mar 23, 2025', time: '3:30 PM', venue: 'M. Chinnaswamy Stadium' },
              { home: 'DC', away: 'PBKS', date: 'Mar 24, 2025', time: '7:30 PM', venue: 'Arun Jaitley Stadium' },
              { home: 'GT', away: 'RR', date: 'Mar 25, 2025', time: '7:30 PM', venue: 'Narendra Modi Stadium' }
            ].map((match, index) => {
              const homeTeam = teams.find(t => t.name === match.home);
              const awayTeam = teams.find(t => t.name === match.away);
              
              return (
                <motion.div
                  key={`${match.home}-${match.away}`}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{match.date}</div>
                      <div className="text-sm font-medium">{match.time}</div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{match.venue}</div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${homeTeam?.bgColor} ${homeTeam?.textColor}`}>
                          <span className="font-bold">{match.home}</span>
                        </div>
                        <span className="font-medium">{homeTeam?.fullName}</span>
                      </div>
                      <div className="font-bold text-lg">VS</div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{awayTeam?.fullName}</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${awayTeam?.bgColor} ${awayTeam?.textColor}`}>
                          <span className="font-bold">{match.away}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Link 
                        href={`/matches/${match.home}-vs-${match.away}`}
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                      >
                        Create Dream11 Team
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Teams Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="py-8"
        >
          <h2 className="text-3xl font-bold text-center mb-8">IPL Teams</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {teams.map((team, index) => (
              <motion.div
                key={team.name}
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className={`${team.bgColor} ${team.textColor} rounded-lg p-4 text-center shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden relative`}
              >
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{ 
                    backgroundImage: 'url(/ipl-pattern.jpg)',
                    backgroundSize: '200px',
                    backgroundRepeat: 'repeat'
                  }}
                ></div>
                <div className="relative z-10">
                  <div className="font-bold text-xl mb-1">{team.name}</div>
                  <div className="text-xs opacity-90">{team.fullName}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Highlight */}
        <section className="py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold mb-4">Real-time Match Tracking</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Stay updated with live match scores and see how your Dream11 team is performing in real-time.
                Our platform syncs with official IPL data to provide accurate and timely updates.
              </p>
              <ul className="space-y-2">
                {['Live score updates', 'Player performance tracking', 'Match statistics', 'Dream11 point calculations'].map((feature, i) => (
                  <motion.li 
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    className="flex items-center"
                  >
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-800 to-blue-500 rounded-xl p-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-full">
                <div className="relative w-full h-64 rounded-lg shadow-md overflow-hidden">
                  <Image 
                    src="/match-tracking.png" 
                    alt="Match Tracking Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="py-12 bg-gray-50 dark:bg-gray-800 rounded-xl my-8 p-8"
        >
          <h2 className="text-3xl font-bold text-center mb-12">What Players Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div 
                key={testimonial.name}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md relative"
              >
                <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                  "
                </div>
                <p className="italic text-gray-600 dark:text-gray-300 mb-4 pt-4">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to start tracking?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of fantasy cricket enthusiasts and see how your Dream11 skills compare!
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg py-3 px-8 rounded-full inline-block shadow-md hover:shadow-lg transition-all"
            >
              Get Started Now
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 pb-4">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Dream11 Rankings. Not affiliated with official Dream11 or IPL.</p>
            <p className="mt-2">All team logos and names are property of their respective owners.</p>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}