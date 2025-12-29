import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from './db';
import { createLogger } from './logger';

const logger = createLogger('auth');

/**
 * Login credentials schema
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * NextAuth.js v5 Configuration
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  providers: [
    // Credentials Provider
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          
          const user = await prisma.user.findUnique({
            where: { email, deletedAt: null },
          });
          
          if (!user || !user.passwordHash) {
            logger.warn({ email }, 'Login attempt with invalid email');
            return null;
          }
          
          const isValid = await bcrypt.compare(password, user.passwordHash);
          
          if (!isValid) {
            logger.warn({ email }, 'Login attempt with invalid password');
            return null;
          }
          
          logger.info({ userId: user.id, email }, 'User logged in');
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          logger.error({ error }, 'Login error');
          return null;
        }
      },
    }),
    
    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    
    // GitHub OAuth (optional)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    
    async signIn({ user, account }) {
      // Log OAuth sign-ins
      if (account?.provider !== 'credentials') {
        logger.info(
          { userId: user.id, provider: account?.provider },
          'OAuth sign-in'
        );
      }
      return true;
    },
  },
  
  events: {
    async signOut(message) {
      if ('token' in message) {
        logger.info({ userId: message.token?.id }, 'User signed out');
      }
    },
  },
  
  trustHost: true,
});

/**
 * Get current session (server-side)
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: 'ADMIN' | 'EDITOR' | 'VIEWER') {
  const session = await getSession();
  if (!session?.user?.role) return false;
  
  const roleHierarchy = { ADMIN: 3, EDITOR: 2, VIEWER: 1 };
  const userLevel = roleHierarchy[session.user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  
  return userLevel >= requiredLevel;
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  
  return prisma.user.findUnique({
    where: { id: session.user.id, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      locale: true,
      theme: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
  
  interface User {
    role?: string;
  }
}
