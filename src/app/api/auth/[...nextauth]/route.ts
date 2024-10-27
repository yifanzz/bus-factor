import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { KyselyAdapter } from "@auth/kysely-adapter";
import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'read:user user:email repo',
                },
            },
        }),
    ],
    adapter: KyselyAdapter(db),
    callbacks: {
        async jwt({ token, account, user }) {
            if (account) {
                token.githubAccessToken = account.access_token
            }
            if (user) {
                token.sub = user.id
            }
            return token
        },
        async session({ session, token, user }) {
            if (session.user) {
                session.user.id = token.sub || user?.id || ""
            }
            if (token.githubAccessToken) {
                session.githubAccessToken = token.githubAccessToken
            }
            return session
        },
    },
    session: {
        strategy: "jwt"
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
