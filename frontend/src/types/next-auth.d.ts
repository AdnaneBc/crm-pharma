import { BusinessRole, OrganizationRole } from "@/app/generated/prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId?: string;
      businessRole?: BusinessRole;
      organizationRole?: OrganizationRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}
