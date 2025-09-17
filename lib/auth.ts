import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from './mongoose'
import User from '@/models/Users'

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      position?: string
      hubId?: string
      hubName?: string
      status?: string
    }
  }
  
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    position?: string
    hubId?: string
    hubName?: string
    status?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/unauthorized', // Redirect to unauthorized page on error
  },
  callbacks: {
    signIn: async ({ user, account, profile }: any) => {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          
          // Check if user exists in our database
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // User not in database, deny access
            return false;
          }
          
          // Update user information with OAuth data on sign-in
          const updateData: any = {
            lastLogin: new Date()
          };

          // If this is their first sign-in (status is pending), activate and populate profile
          if (existingUser.status === 'pending') {
            updateData.status = 'active';
            updateData.name = user.name || '';
            updateData.image = user.image || '';
            updateData.emailVerified = new Date();
          } else if (existingUser.status !== 'active') {
            // User is inactive, deny access
            return false;
          }

          // Always update name and image in case they changed in OAuth provider
          updateData.name = user.name || existingUser.name;
          updateData.image = user.image || existingUser.image;
          
          // Update user record
          await User.findOneAndUpdate(
            { email: user.email },
            updateData,
            { new: true }
          );
          
          return true;
        } catch (error) {
          console.error('Error checking user authorization:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
    
      
      if (user) {
        // This runs when user signs in
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.position = dbUser.position;
            token.hubId = dbUser.hubId?.toString();
            token.hubName = dbUser.hubName;
            token.status = dbUser.status;
          }
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }: any) {
      console.log('Session callback - token:', token);
      console.log('Session callback - session:', session);
      
      // Add user data to session from token
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.position = token.position as string;
        session.user.hubId = token.hubId as string;
        session.user.hubName = token.hubName as string;
        session.user.status = token.status as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - url:', url)
      console.log('Redirect callback - baseUrl:', baseUrl)
      
      try {
        // Use the provided baseUrl as fallback if NEXTAUTH_URL is not set
        const correctBaseUrl = process.env.NEXTAUTH_URL || baseUrl
        console.log('Using correct baseUrl:', correctBaseUrl)
        
        // If the URL is the root path after sign-in, redirect to dashboard selection
        if (url === '/' || url === correctBaseUrl) {
          const dashboardSelectUrl = `${correctBaseUrl}/dashboard-select`
          console.log('Redirecting to dashboard selection:', dashboardSelectUrl)
          return dashboardSelectUrl
        }
        
        // Allows relative callback URLs
        if (url.startsWith("/")) {
          const redirectUrl = `${correctBaseUrl}${url}`
          console.log('Redirecting to:', redirectUrl)
          return redirectUrl
        }
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === new URL(correctBaseUrl).origin) {
          console.log('Same origin redirect to:', url)
          return url
        }
        
        console.log('Default redirect to dashboard selection:', `${correctBaseUrl}/dashboard-select`)
        return `${correctBaseUrl}/dashboard-select`
      } catch (error) {
        console.error('Redirect callback error:', error)
        return `${baseUrl}/dashboard-select`
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
