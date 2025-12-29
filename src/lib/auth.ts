import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { loginSchema } from './validators/auth';
import { createLogger } from './logger';

const logger = createLogger('auth');

/**
 * NextAuth.js v5 Configuration
 * Session-based authentication with optional OAuth providers
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validated = loginSchema.safeParse(credentials);
          if (!validated.success) {
            logger.warn('Invalid login credentials format');
            return null;
          }
          
          const { email, password } = validated.data;
          
          // Find user
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              role: true,
              image: true,
              locale: true,
              deletedAt: true,
            },
          });
          
          // Check if user exists and is not deleted
          if (!user || user.deletedAt) {
            logger.warn({ email }, 'User not found or deleted');
            return null;
          }
          
          // Check if user has a password (OAuth users may not)
          if (!user.passwordHash) {
            logger.warn({ email }, 'User has no password');
            return null;
          }
          
          // Verify password
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            logger.warn({ email }, 'Invalid password');
            return null;
          }
          
          logger.info({ userId: user.id, email }, 'User logged in successfully');
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            locale: user.locale,
          };
        } catch (error) {
          logger.error({ error }, 'Auth error');
          return null;
        }
      },
    }),
    
    // Optional: Google OAuth
    // ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    //   ? [
    //       Google({
    //         clientId: process.env.GOOGLE_CLIENT_ID,
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //       }),
    //     ]
    //   : []),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.locale = user.locale;
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.locale = session.locale;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.locale = token.locale as string;
      }
      return session;
    },
    
    async signIn({ user, account }) {
      // Log OAuth sign-ins
      if (account?.provider !== 'credentials') {
        logger.info({ userId: user.id, provider: account?.provider }, 'OAuth sign in');
      }
      return true;
    },
  },
  
  events: {
    async signOut({ token }) {
      logger.info({ userId: token?.id }, 'User signed out');
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  return prisma.user.findUnique({
    where: { id: session.user.id },
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
 * Check if user has required role
 */
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === 'ADMIN';
}

/**
 * Check if user can edit (admin or editor)
 */
export function canEdit(userRole: string | undefined): boolean {
  return hasRole(userRole, ['ADMIN', 'EDITOR']);
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password with bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
