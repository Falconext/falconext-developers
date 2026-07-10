import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// ─── Tipos aumentados para NextAuth ──────────────────────────────────────
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      mypeUserId?: number;
      empresaId?: number | null;
      rol?: string;
    } & DefaultSession["user"];
  }
}

type MypeJwt = {
  accessToken?: string;
  refreshToken?: string;
  mypeUserId?: number;
  empresaId?: number | null;
  rol?: string;
  error?: string;
};

// ─── Config ──────────────────────────────────────────────────────────────
const API = process.env.MYPE_API_URL ?? "http://localhost:4001/api";
const OAUTH_SECRET = process.env.OAUTH_SIGNIN_SECRET ?? "";

const providers: any[] = [
  Credentials({
    name: "Credenciales",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "");
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return null;
      const wrapped = await res.json();
      const data = wrapped?.data ?? wrapped;
      if (!data?.accessToken) return null;

      return {
        id: String(data.usuario?.id),
        name: data.usuario?.nombre,
        email: data.usuario?.email,
        image: data.usuario?.avatarUrl ?? null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        mypeUserId: data.usuario?.id,
        empresaId: data.usuario?.empresaId ?? null,
        rol: data.usuario?.rol,
      } as any;
    },
  }),
];

// Google/GitHub solo si están configurados.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/console/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Credentials ya trae accessToken en `user`.
      if (account?.provider === "credentials") return true;

      // Google / GitHub → intercambia por tokens de MyPE via /auth/oauth-signin.
      if (!user.email) return false;
      if (!OAUTH_SECRET) {
        console.error(
          "[auth] OAUTH_SIGNIN_SECRET no configurado — no se puede intercambiar OAuth por JWT del ERP",
        );
        return false;
      }

      try {
        const res = await fetch(`${API}/auth/oauth-signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-OAuth-Signin-Secret": OAUTH_SECRET,
          },
          body: JSON.stringify({
            provider: account?.provider,
            providerId: account?.providerAccountId,
            email: user.email,
            name: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
          }),
        });
        if (!res.ok) {
          console.error("[auth] oauth-signin fallo:", res.status);
          return false;
        }
        const wrapped = await res.json();
        const data = wrapped?.data ?? wrapped;
        // Adjunta al `user` para que `jwt` callback los persista.
        (user as any).accessToken = data.accessToken;
        (user as any).refreshToken = data.refreshToken;
        (user as any).mypeUserId = data.usuario?.id;
        (user as any).empresaId = data.usuario?.empresaId ?? null;
        (user as any).rol = data.usuario?.rol;
        return true;
      } catch (err) {
        console.error("[auth] oauth-signin error:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      const t = token as MypeJwt;
      if (user) {
        t.accessToken = (user as any).accessToken;
        t.refreshToken = (user as any).refreshToken;
        t.mypeUserId = (user as any).mypeUserId;
        t.empresaId = (user as any).empresaId ?? null;
        t.rol = (user as any).rol;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as MypeJwt;
      session.accessToken = t.accessToken;
      session.refreshToken = t.refreshToken;
      session.user.mypeUserId = t.mypeUserId;
      session.user.empresaId = t.empresaId ?? null;
      session.user.rol = t.rol;
      if (t.error) session.error = t.error;
      return session;
    },
  },
});
