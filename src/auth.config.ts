import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth }) {
            // Logged in users are authenticated, otherwise redirect to login
            return !!auth
        },
    },
    providers: [], // Providers added in auth.ts to avoid Edge Runtime issues with some libs
    theme: {
        colorScheme: "dark",
        brandColor: "#00f3ff",
        logo: "",
    },
} satisfies NextAuthConfig;
