'use client'

import { useEffect, useState } from 'react'
import { Inter } from 'next/font/google'
import './global.css'

import Header from '../components/Header'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          if (user) {
            const rewards = await getAvailableRewards(user.id)
            setTotalEarnings(rewards as unknown as number)
          }
        }
      } catch (e) {
        console.error("Error fetching total earnings", e)
      }
    }

    fetchTotalEarnings()
  }, [])

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-gray-900 bg-gray-100`}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              totalEarnings={totalEarnings}
            />
            <div className="flex flex-1">
              <Sidebar open={sidebarOpen} />
              <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 lg:ml-64 transition-all duration-300 ease-in-out">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </SessionProvider>
      </body>
    </html>
  )
}
