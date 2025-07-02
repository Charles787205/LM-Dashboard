# Authentication Setup Guide

This application uses NextAuth.js with Google OAuth for authentication.

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

### 2. Environment Variables

Update your `.env.local` file with the Google OAuth credentials:

```bash
# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 3. Generate NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

## Features

- **Google OAuth Login**: Users can sign in with their Google accounts
- **Protected Routes**: All routes except `/login` require authentication
- **Session Management**: User sessions are stored in MongoDB
- **User Profile**: User information from Google is displayed in the navbar
- **Sign Out**: Users can sign out from the navbar dropdown

## How it Works

1. **Authentication Flow**: Users are redirected to `/login` if not authenticated
2. **Google OAuth**: Clicking "Continue with Google" initiates OAuth flow
3. **Session Storage**: User sessions are stored in MongoDB using the MongoDB adapter
4. **Route Protection**: Middleware protects all routes except authentication routes
5. **User Interface**: Authenticated users see their profile in the navbar with sign-out option

## Files Created/Modified

- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `app/login/page.tsx` - Login page with Google OAuth
- `app/providers.tsx` - SessionProvider wrapper
- `app/layout.tsx` - Updated to include SessionProvider
- `components/Navbar.tsx` - Updated with user profile and sign-out
- `middleware.ts` - Route protection middleware
- `.env.local` - Environment variables for OAuth

## Testing

1. Make sure MongoDB is running
2. Set up Google OAuth credentials
3. Start the development server: `npm run dev`
4. Visit `http://localhost:3000` - you should be redirected to `/login`
5. Click "Continue with Google" to test the OAuth flow
