'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from './ui/button'
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Badge } from './ui/badge'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { createUser, getUserByEmail, getUnreadNotifications, markNotificationAsRead, getUserBalance } from '@/utils/db/actions'

interface HeaderProps {
  onMenuClick: () => void
  totalEarnings: number
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const { data: session, status } = useSession()
  const [balance, setBalance] = useState(0)
  const [notification, setNotification] = useState<any[]>([])
  const isMobile = useMediaQuery('(max-width:760px)')
  const pathname = usePathname()

  const email = session?.user?.email ?? ''

  useEffect(() => {
    if (session?.user?.email && session.user.name) {
      localStorage.setItem('userEmail', session.user.email)
      createUser(session.user.email, session.user.name)
    }
  }, [session])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!email) return
      const user = await getUserByEmail(email)
      if (user) {
        const unread = await getUnreadNotifications(user.id)
        setNotification(unread)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [email])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!email) return
      const user = await getUserByEmail(email)
      if (user) {
        const userBalance = await getUserBalance(user.id)
        setBalance(userBalance)
      }
    }
    fetchBalance()
    const onUpdate = (event: CustomEvent) => setBalance(event.detail)
    window.addEventListener('balanceUpdate', onUpdate as EventListener)
    return () => window.removeEventListener('balanceUpdate', onUpdate as EventListener)
  }, [email])

  const handleNotificationClick = async (id: number) => {
    await markNotificationAsRead(id)
  }

  return (
    <header className='bg-white shadow-md border-b sticky top-0 z-50'>
      <div className='flex items-center justify-between px-4 py-2'>
        <div className='flex items-center'>
          <Button variant='ghost' size='icon' className='mr-2' onClick={onMenuClick}>
            <Menu className='h-6 w-6 text-orange-600' />
          </Button>
          <Link href='/' className='flex items-center'>
            <Leaf className='h-6 w-6 text-orange-600 mr-2' />
            <span className='font-bold text-lg text-gray-800'>EcoTrash</span>
          </Link>
        </div>

        {!isMobile && (
          <div className='flex-1 max-w-xl mx-4'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search here...'
                className='w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:outline-none'
              />
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500' />
            </div>
          </div>
        )}

        <div className='flex items-center'>
          {isMobile && (
            <Button variant='ghost' size='icon' className='mr-2'>
              <Search className='h-5 w-5 text-orange-600' />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='relative mr-2'>
                <Bell className='h-5 w-5 text-orange-600' />
                {notification.length > 0 && (
                  <Badge className='absolute -top-1 -right-1 text-white bg-orange-600 rounded-full shadow-sm px-1.5 min-w-[1.2rem]'>
                    {notification.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              {notification.length > 0 ? (
                notification.map((n: any) => (
                  <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n.id)}>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>{n.type}</span>
                      <span className='text-sm text-gray-500'>{n.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new Notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='mr-3 md:mr-4 flex items-center bg-orange-100 rounded-full px-3 py-1 shadow-sm'>
            <Coins className='h-4 w-4 mr-1 text-orange-600' />
            <span className='font-semibold text-sm text-orange-700'>
              {balance.toFixed(2)}
            </span>
          </div>

          {status === 'authenticated' ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant='ghost' size='icon' className='flex items-center'>
                  <User className='h-5 w-5 text-orange-600' />
                  <ChevronDown className='h-4 w-4 ml-1 text-orange-600' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>{session.user?.name || 'Profile'}</DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href='/settings'>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className='h-4 w-4 mr-2' /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn('google')} className='bg-orange-600 hover:bg-orange-700 text-white text-sm'>
              Login <LogIn className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
