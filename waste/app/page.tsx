// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { ArrowRight, Leaf, Recycle, Users, Coins, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import { getRecentReports, getAllRewards, getWasteCollectionTasks } from '@/utils/db/actions'

const poppins = Poppins({ 
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

function AnimatedGlobe() {
  return (
    <div className="relative w-36 h-36 mx-auto mb-10">
      <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-orange-500 opacity-30 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-orange-300 opacity-50 animate-spin-slow"></div>
      <div className="absolute inset-6 rounded-full bg-orange-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-orange-600 animate-pulse" />
    </div>
  )
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0
  })

  useEffect(() => {
    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100)
        const rewards = await getAllRewards()
        const tasks = await getWasteCollectionTasks(100)

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/)
          const amount = match ? parseFloat(match[0]) : 0
          return total + amount
        }, 0)

        const reportsSubmitted = reports.length
        const tokensEarned = rewards.reduce((total, reward) => total + (reward.points || 0), 0)
        const co2Offset = wasteCollected * 0.5

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10,
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10
        })
      } catch (error) {
        console.error("Error fetching impact data:", error)
        setImpactData({
          wasteCollected: 0,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0
        })
      }
    }

    fetchImpactData()
  }, [])

  const login = () => setLoggedIn(true)

  return (
    <div className={`container mx-auto px-6 py-20 ${poppins.className}`}>
      <section className="text-center mb-24">
        <AnimatedGlobe />
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 tracking-tight">
          Ecology Management <span className="text-orange-600">Trash Disposal</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
          Together we can make a healthy world.
        </p>
        {!loggedIn ? (
          <Button
            onClick={login}
            className="bg-orange-600 hover:bg-orange-700 text-white text-lg py-5 px-12 rounded-full font-medium shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href="/report">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white text-lg py-5 px-12 rounded-full font-medium shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
              Report Waste
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-10 mb-24">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Help build a cleaner future by reporting and reducing waste."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Gain tokens and recognition for your sustainable contributions."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a passionate community working towards change."
        />
      </section>

      <section className="bg-gradient-to-br from-orange-50 to-white p-12 rounded-3xl shadow-xl mb-24">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <ImpactCard title="Waste Collected" value={`${impactData.wasteCollected} kg`} icon={Recycle} />
          <ImpactCard title="Reports Submitted" value={impactData.reportsSubmitted.toString()} icon={MapPin} />
          <ImpactCard title="Tokens Earned" value={impactData.tokensEarned.toString()} icon={Coins} />
          <ImpactCard title="CO₂ Offset" value={`${impactData.co2Offset} kg`} icon={Leaf} />
        </div>
      </section>
    </div>
  )
}

function ImpactCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-300 text-center">
      <Icon className="h-10 w-10 text-orange-500 mx-auto mb-4" />
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center">
      <div className="bg-orange-100 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-orange-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
