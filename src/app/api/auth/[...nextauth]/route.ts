import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import NextAuth from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          dreamXIUsername: user.dreamXIUsername,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_EXPIRY_SECONDS || '302400') // 84 hours in seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dreamXIUsername = user.dreamXIUsername;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.dreamXIUsername = token.dreamXIUsername as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if the URL is a sign-in callback
      if (url.startsWith(baseUrl) && url.includes('/api/auth/callback')) {
        // Get the user's session to check their role
        const session = await getServerSession(authOptions);
        
        // If user is an admin, redirect to admin dashboard
        if (session?.user?.role === 'ADMIN') {
          return `${baseUrl}/admin`;
        }
        
        // Default redirect for non-admin users
        return `${baseUrl}/dashboard`;
      }
      
      // For all other cases, use the default behavior
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
};

// Export the NextAuth handler functions for the API route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export const getAuthSession = () => getServerSession(authOptions);