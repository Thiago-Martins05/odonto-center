import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Teste simples com credenciais hardcoded
        if (
          credentials?.email === "admin@odontocenter.com" &&
          credentials?.password === "admin123"
        ) {
          return {
            id: "1",
            email: "admin@odontocenter.com",
            name: "Administrador",
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
