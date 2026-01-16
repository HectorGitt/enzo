import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";

export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	providers: [
		GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			authorization: {
				params: {
					scope: "read:user repo",
				},
			},
		}),
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		LinkedIn({
			clientId: process.env.LINKEDIN_CLIENT_ID,
			clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
		}),
	],
	pages: {
		signIn: "/login", // Use custom login page
		error: "/login", // Redirect errors to login page
	},
	theme: {
		colorScheme: "dark",
		brandColor: "#00f3ff",
		logo: "", // TODO: Add logo URL
	},
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				token.accessToken = account.access_token;
				token.provider = account.provider; // Store the provider
			}
			if (profile) {
				token.username = profile.login;
			}
			return token;
		},
		async session({ session, token }) {
			// @ts-ignore
			session.accessToken = token.accessToken;
			// @ts-ignore
			session.provider = token.provider; // Expose provider in session
			// @ts-ignore
			if (session.user) session.user.username = token.username;
			return session;
		},
		authorized: async ({ auth }) => {
			// Logged in users are authenticated, otherwise redirect to login
			return !!auth;
		},
	},
});
