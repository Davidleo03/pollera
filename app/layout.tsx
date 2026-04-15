import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AdminProvider } from '@/context/AdminContext'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sistema Administrativo - Personal Obrero',
  description: 'Gestión de personal, asistencia, nómina y reportes',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/pollos.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/pollos.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/pollos.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        <AdminProvider>
          {children}
        </AdminProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
