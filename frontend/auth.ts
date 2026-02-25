import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && account.providerAccountId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              google_id: account.providerAccountId,
              name: user.name,
              email: user.email,
              image: user.image,
            }),
          });
          const data = await res.json();
          if (data.isNew) {
            (user as { isNew?: boolean }).isNew = true;
          }
        } catch (err) {
          console.error('[Auth] Failed to sync user:', err);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { google_id?: string; isNew?: boolean }).google_id = token.sub as string;
        (session.user as { google_id?: string; isNew?: boolean }).isNew = !!(token.isNew);
      }
      return session;
    },
    async jwt({ token, account, user }) {
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      if ((user as { isNew?: boolean })?.isNew) {
        token.isNew = true;
      }
      return token;
    },
  },
});
