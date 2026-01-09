import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import Slack from "next-auth/providers/slack"
import Credentials from "next-auth/providers/credentials"
import { getProfile, saveProfile } from "./lib/store"

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
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        Slack({
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Mock authentication for MVP - allow any login
                // In a real app, verify against DB
                if (credentials?.email && credentials?.password) {
                    return {
                        id: "user_1",
                        name: "Enzo User",
                        email: String(credentials.email),
                        image: "https://avatars.githubusercontent.com/u/123456"
                    }
                }
                return null
            }
        })
    ],
    theme: {
        colorScheme: "dark",
        brandColor: "#00f3ff",
        logo: "", // TODO: Add logo URL
    },
    callbacks: {
        async jwt({ token, account, profile, user }) {
            // Initial sign in
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
                token.username = (profile as any)?.login
                token.provider = account.provider

                // Track connected provider
                if (user?.email) {
                    try {
                        const userProfile = await getProfile(user.email);
                        const providerId = account.provider;
                        const currentProviders = userProfile.connectedProviders || [];

                        if (!currentProviders.includes(providerId)) {
                            userProfile.connectedProviders = [...currentProviders, providerId];
                            await saveProfile(userProfile);
                        }
                    } catch (e) {
                        console.error("Failed to sync provider connection:", e);
                    }
                }
                return token
            }

            // Return previous token if the access token has not expired yet
            // GitHub tokens might not have expires_at if they are non-expiring
            // If expiresAt is set, we check it.
            if (!token.expiresAt || Date.now() < (token.expiresAt as number) * 1000) {
                return token
            }

            // Access token has expired, try to update it
            try {
                // If using GitHub, we need to refresh
                // Note: Only works if the App is configured to expire tokens and issuance of refresh tokens
                if (!token.refreshToken) throw new Error("No refresh token available")

                const response = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({
                        client_id: process.env.GITHUB_ID,
                        client_secret: process.env.GITHUB_SECRET,
                        grant_type: "refresh_token",
                        refresh_token: token.refreshToken,
                    }),
                })

                const tokens = await response.json()

                if (!response.ok) throw tokens

                return {
                    ...token,
                    accessToken: tokens.access_token,
                    expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
                    refreshToken: tokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
                }
            } catch (error) {
                console.error("Error refreshing access token", error)
                return { ...token, error: "RefreshAccessTokenError" }
            }
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken
            // @ts-ignore
            session.error = token.error
            // @ts-ignore
            session.provider = token.provider
            // @ts-ignore
            if (session.user) session.user.username = token.username
            return session
        },
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login
            return !!auth
        },
    },
})

declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
        accessToken?: string
        provider?: string
    }
}

// Note: next-auth/jwt types are problematic in v5 beta in this environment.
// We are using @ts-ignore in the callbacks where necessary.
