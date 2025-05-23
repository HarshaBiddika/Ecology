'use client'

import { useState, useEffect } from 'react'
import { Coins, ArrowUpRight, ArrowDownRight, Gift, AlertCircle, Loader } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { getUserByEmail, getRewardTransactions, getAvailableRewards, redeemReward, createTransaction } from '@/utils/db/actions'
import { toast } from "react-hot-toast";

// Types

type Transaction = {
  id: number
  type: 'earned_report' | 'earned_collect' | 'redeemed'
  amount: number
  description: number
  date: string
}

type Reward = {
  id: number
  name: string
  cost: number
  description: string | null
  collectionInfo: string
}

export default function RewardsPage() {
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDataAndRewards = async () => {
      setLoading(true)
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail)
          if (fetchedUser) {
            setUser(fetchedUser)
            const fetchedTransactions = await getRewardTransactions(fetchedUser.id)
            setTransactions(fetchedTransactions as Transaction[])
            const fetchedRewards = await getAvailableRewards(fetchedUser.id)
            setRewards(fetchedRewards.filter(r => r.cost > 0))
            const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
              return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
            }, 0)
            setBalance(Math.max(calculatedBalance, 0))
          } else {
            toast.error('User not found. Please log in again.')
          }
        } else {
          toast.error('User not logged in. Please log in.')
        }
      } catch (error) {
        console.error('Error fetching user data and rewards:', error)
        toast.error('Failed to load rewards data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDataAndRewards()
  }, [])

  const handleRedeemReward = async (rewardId: number) => {
    if (!user) {
      toast.error('Please log in to redeem rewards.')
      return
    }

    const reward = rewards.find(r => r.id === rewardId)
    if (reward && balance >= reward.cost && reward.cost > 0) {
      try {
        await redeemReward(user.id, rewardId);
        await createTransaction(user.id, 'redeemed', reward.cost, `Redeemed ${reward.name}`);
        await refreshUserData();
        toast.success(`You have successfully redeemed: ${reward.name}`)
      } catch (error) {
        console.error('Error redeeming reward:', error)
        toast.error('Failed to redeem reward. Please try again.')
      }
    } else {
      toast.error('Insufficient balance or invalid reward cost')
    }
  }

  const handleRedeemAllPoints = async () => {
    if (!user) {
      toast.error('Please log in to redeem points.');
      return;
    }

    if (balance > 0) {
      try {
        await redeemReward(user.id, 0);
        await createTransaction(user.id, 'redeemed', balance, 'Redeemed all points');
        await refreshUserData();
        toast.success(`You have successfully redeemed all your points!`);
      } catch (error) {
        console.error('Error redeeming all points:', error);
        toast.error('Failed to redeem all points. Please try again.');
      }
    } else {
      toast.error('No points available to redeem')
    }
  }

  const refreshUserData = async () => {
    if (user) {
      const fetchedUser = await getUserByEmail(user.email);
      if (fetchedUser) {
        const fetchedTransactions = await getRewardTransactions(fetchedUser.id);
        setTransactions(fetchedTransactions as Transaction[]);
        const fetchedRewards = await getAvailableRewards(fetchedUser.id);
        setRewards(fetchedRewards.filter(r => r.cost > 0));
        const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
          return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
        }, 0)
        setBalance(Math.max(calculatedBalance, 0))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-orange-500" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto bg-orange-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-orange-800 border-b-4 border-orange-400 pb-2">Your Rewards Center</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-8 border-orange-500 mb-8">
        <h2 className="text-2xl font-bold text-orange-700 mb-3">Points Summary</h2>
        <div className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-orange-500" />
          <div>
            <p className="text-5xl font-extrabold text-orange-600">{balance}</p>
            <p className="text-gray-500">Current Reward Points</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-lg shadow-lg p-5">
          <h2 className="text-xl font-semibold text-orange-700 mb-4">Transaction History</h2>
          {transactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    {transaction.type === 'earned_report' ? (
                      <ArrowUpRight className="text-green-500" />
                    ) : transaction.type === 'earned_collect' ? (
                      <ArrowUpRight className="text-blue-500" />
                    ) : (
                      <ArrowDownRight className="text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${transaction.type.startsWith('earned') ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type.startsWith('earned') ? '+' : '-'}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No transaction records</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-5">
          <h2 className="text-xl font-semibold text-orange-700 mb-4">Available Rewards</h2>
          {rewards.length > 0 ? (
            <div className="space-y-5">
              {rewards.map(reward => (
                <div key={reward.id} className="border border-orange-200 p-4 rounded-md bg-orange-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-orange-800">{reward.name}</h3>
                    <span className="font-semibold text-orange-600">{reward.cost} pts</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
                  <p className="text-xs text-orange-700 mb-3">{reward.collectionInfo}</p>
                  <Button
                    onClick={() => reward.id === 0 ? handleRedeemAllPoints() : handleRedeemReward(reward.id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={reward.id !== 0 && balance < reward.cost}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {reward.id === 0 ? 'Redeem All Points' : 'Redeem Reward'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-orange-100 p-4 rounded-md flex items-center text-orange-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              No rewards currently available. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
