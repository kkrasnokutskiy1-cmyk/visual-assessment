import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (typeof credentials.email !== "string" || typeof credentials.password !== "string" || Buffer.byteLength(credentials.password, "utf8") > 72 || credentials.email.length > 254) return null;
      const email = credentials.email.trim().toLowerCase();
      const limit = await db().query(`INSERT INTO login_limits (email) VALUES ($1)
        ON CONFLICT (email) DO UPDATE SET
          window_started = CASE WHEN login_limits.window_started < now() - interval '15 minutes' THEN now() ELSE login_limits.window_started END,
          attempts = CASE WHEN login_limits.window_started < now() - interval '15 minutes' THEN 1 ELSE login_limits.attempts + 1 END
        RETURNING attempts`, [email]);
      if (limit.rows[0].attempts > 10) return null;
      const result = await db().query("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
      const matches = await compare(credentials.password, user?.password_hash ?? "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYvN9YqQeYjgPXo3PbbxW5BNQahFn7aK");
      if (!user || !matches) return null;
      return { id: user.id, email: user.email };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
