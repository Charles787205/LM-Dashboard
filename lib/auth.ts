import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

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
    }
  }
  
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    position?: string
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
    error: '/login', // Redirect to login on error
  },
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback - token:', token)
      console.log('Session callback - session:', session)
      // Add user ID to session from token
      if (session?.user && token) {
        session.user.id = token.sub as string
        // Add custom fields if they exist
        if (token.role) {
          session.user.role = token.role as string
        }
        if (token.position) {
          session.user.position = token.position as string
        }
      }
      return session
    },
    async jwt({ token, user }) {
      console.log('JWT callback - user:', user)
      console.log('JWT callback - token:', token)
      // This callback is called whenever a JWT is created
      if (user) {
        token.id = user.id
        // Add custom fields if they exist
        if ((user as any).role) {
          token.role = (user as any).role
        }
        if ((user as any).position) {
          token.position = (user as any).position
        }
      }
      return token
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - user:', user)
      console.log('SignIn callback - account:', account)
      console.log('SignIn callback - profile:', profile)
      
      try {
        // Ensure we have required fields
        if (!user.email) {
          console.error('SignIn failed: No email provided')
          return false
        }
        
        console.log('SignIn successful for:', user.email)
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - url:', url)
      console.log('Redirect callback - baseUrl:', baseUrl)
      
      try {
        // Use the provided baseUrl as fallback if NEXTAUTH_URL is not set
        const correctBaseUrl = process.env.NEXTAUTH_URL || baseUrl
        console.log('Using correct baseUrl:', correctBaseUrl)
        
        // If the URL is the root path after sign-in, redirect to dashboard
        if (url === '/' || url === correctBaseUrl) {
          const dashboardUrl = `${correctBaseUrl}/hubs`
          console.log('Redirecting to dashboard:', dashboardUrl)
          return dashboardUrl
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
        
        console.log('Default redirect to dashboard:', `${correctBaseUrl}/hubs`)
        return `${correctBaseUrl}/hubs`
      } catch (error) {
        console.error('Redirect callback error:', error)
        return `${baseUrl}/hubs`
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
