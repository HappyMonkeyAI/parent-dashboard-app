import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      familyId: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: string;
    familyId: string;
  }
}
