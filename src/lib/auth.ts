
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"


declare module "next-auth" {
  interface User {
    tenant: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      tenant: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    tenant: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            tenant: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenant: user.tenant.slug
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            tenant: token.tenant
          }
        }
      }
      return session
    },
    jwt: ({ token, user }) => {
      if (user) {
        
        return {
          ...token,
          id: user.id,
          tenant: user.tenant
        }
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/login", 
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}