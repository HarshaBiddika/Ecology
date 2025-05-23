import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { MapPin, Trash, Coins, Medal, Settings, Home } from 'lucide-react'

const sidebarItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/report', label: 'Report Waste', icon: MapPin },
  { href: '/collect', label: 'Collect Waste', icon: Trash },
  { href: '/rewards', label: 'Rewards', icon: Coins },
  { href: '/leaderboard', label: 'Leaderboard', icon: Medal },
]

interface SidebarProps {
  open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`bg-orange-50 border-r border-orange-200 text-orange-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out shadow-md ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col justify-between pt-20">
        <div className="px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-100 text-orange-900'
                    : 'hover:bg-orange-100 text-orange-700'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-orange-200">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start py-3 rounded-lg text-base font-medium transition-colors ${
                pathname === '/settings'
                  ? 'bg-orange-100 text-orange-900'
                  : 'hover:bg-orange-100 text-orange-700'
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
