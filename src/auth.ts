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
            if (account) {
                token.accessToken = account.access_token

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
            }
            if (profile) {
                token.username = (profile as any).login
            }
            return token
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken
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
