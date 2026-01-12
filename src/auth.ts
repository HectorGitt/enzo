import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				// Mock authentication for MVP - allow any login
				// In a real app, verify against DB
				if (credentials?.email && credentials?.password) {
					return {
						id: "user_1",
						name: "Enzo User",
						email: String(credentials.email),
						image: "https://avatars.githubusercontent.com/u/123456",
					};
				}
				return null;
			},
		}),
	],
	theme: {
		colorScheme: "dark",
		brandColor: "#00f3ff",
		logo: "", // TODO: Add logo URL
	},
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				token.accessToken = account.access_token;
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
			if (session.user) session.user.username = token.username;
			return session;
		},
		authorized: async ({ auth }) => {
			// Logged in users are authenticated, otherwise redirect to login
			return !!auth;
		},
	},
});
