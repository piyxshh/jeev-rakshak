// app/page.tsx
'use client'

import { useState } from 'react'
import { Phone, LockKeyhole } from 'lucide-react' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('signIn')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleAuthAction = async () => {
    setLoading(true)
    try {
      if (activeTab === 'signUp') {
        const { error } = await supabase.auth.signUp({
          phone: `+91${phone}`,
          password: password,
        });
        if (error) throw error;
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          phone: `+91${phone}`,
          password: password,
        });
        if (error) throw error;
        router.push('/dashboard')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-orange-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 2.5C23.76 2.5 2.5 23.76 2.5 50V90L50 97.5L97.5 90V50C97.5 23.76 76.24 2.5 50 2.5Z" fill="#0D2B4D" />
              <path d="M50 40C45 40 42 43 42 48V58H58V48C58 43 55 40 50 40ZM45 35C45 32 47 30 50 30C53 30 55 32 55 35V38H45V35ZM38 52H42V56H38V52ZM62 52H58V56H62V52Z" fill="white"/>
              <path d="M70 20H75V25H80V30H75V35H70V30H65V25H70V20Z" fill="#38A169"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{color: '#0D2B4D'}}>
            Jeev Rakshak
          </h1>
          <p className="text-gray-600 font-medium">Securing India&apos;s Livestock</p>
        </div>

        <div className="flex relative mt-8 pt-2">
            <div className={`absolute bottom-0 h-1 bg-green-500 transition-all duration-300 ${activeTab === 'signIn' ? 'left-0 w-1/2' : 'left-1/2 w-1/2 bg-orange-500'}`} />
            <button
                onClick={() => setActiveTab('signIn')}
                className={`flex-1 py-3 text-lg font-semibold text-center transition-colors duration-300 ${activeTab === 'signIn' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}
            >
                Sign In
            </button>
            <button
                onClick={() => setActiveTab('signUp')}
                className={`flex-1 py-3 text-lg font-semibold text-center transition-colors duration-300 ${activeTab === 'signUp' ? 'text-orange-700' : 'text-gray-500 hover:text-orange-600'}`}
            >
                Sign Up
            </button>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-gray-900 placeholder-gray-500"
              style={{ caretColor: '#38A169' }}
            />
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-gray-900 placeholder-gray-500"
              style={{ caretColor: '#38A169' }}
            />
          </div>
        </div>

        <div>
          <button
            onClick={handleAuthAction}
            disabled={loading || phone.length < 10 || password.length < 6}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
              activeTab === 'signIn' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? 'Processing...' : (activeTab === 'signIn' ? 'Sign In' : 'Create Account')}
          </button>
        </div>
      </div>
    </main>
  )
}