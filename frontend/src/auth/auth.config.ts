import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User not found");

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!valid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.userId = user.id;
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token.userId) return session;

      const membership = await prisma.organizationUser.findFirst({
        where: { userId: token.userId },
      });

      session.user.id = token.userId;
      session.user.organizationId = membership?.organizationId;
      session.user.businessRole = membership?.businessRole;
      session.user.organizationRole = membership?.organizationRole;

      return session;
    },
  },
};
