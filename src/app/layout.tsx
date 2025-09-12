// src/app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/providers/SessionProvider" 

// Configuración de las fuentes
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Sistema Multirubro - Plataforma Multitenant para Negocios",
  description: "Sistema completo para gestionar múltiples negocios y rubros desde una sola plataforma.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.className} antialiased`}>
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}