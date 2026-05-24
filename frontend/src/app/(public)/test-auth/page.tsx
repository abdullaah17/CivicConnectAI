'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/store/authStore'
import { mockLogin, testAuthState, clearAuthState } from '@/utils/testAuth'
import toast from 'react-hot-toast'

export default function TestAuthPage() {
  const [identifier, setIdentifier] = useState('resident@test.com')
  const [password, setPassword] = useState('Test@1234')
  const [loading, setLoading] = useState(false)
  const { setAuth, isAuthenticated, user } = useAuthStore()

  const handleMockLogin = async () => {
    setLoading(true)
    try {
      const result = await mockLogin(identifier, password)
      setAuth(result.user, result.accessToken)
      toast.success(`Logged in as ${result.user.name}`)
      
      // Navigate based on role
      setTimeout(() => {
        if (result.user.role === 'resident') {
          window.location.href = '/dashboard'
        } else if (result.user.role === 'staff') {
          window.location.href = '/staff/dashboard'
        } else if (result.user.role === 'dept_admin') {
          window.location.href = '/admin/dashboard'
        }
      }, 1000)
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestState = () => {
    testAuthState()
  }

  const handleClearState = () => {
    clearAuthState()
    toast.success('Auth state cleared')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow">Test Authentication</h1>
          <p className="text-white/70 text-sm mt-1">Test the authentication flow with mock data</p>
        </div>

        <div className="card-glass p-6 space-y-6">
          {/* Current State */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Current State</h3>
            <p className="text-sm text-white/70">
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </p>
            {user && (
              <p className="text-sm text-white/70">
                User: {user.name} ({user.role})
              </p>
            )}
          </div>

          {/* Mock Login Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Mock Login</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Test User
              </label>
              <select 
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setPassword('Test@1234')
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="resident@test.com">Resident User</option>
                <option value="staff@test.com">Staff User</option>
                <option value="admin@test.com">Admin User</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              onClick={handleMockLogin}
              loading={loading}
              className="w-full !bg-black !text-[#E1E0CC] hover:!bg-black/80"
            >
              Mock Login
            </Button>
          </div>

          {/* Test Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Test Actions</h3>
            
            <Button
              onClick={handleTestState}
              variant="outline"
              className="w-full"
            >
              Test Auth State (Check Console)
            </Button>
            
            <Button
              onClick={handleClearState}
              variant="outline"
              className="w-full"
            >
              Clear Auth State
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Instructions</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>1. Select a test user and click "Mock Login"</li>
              <li>2. You should be redirected to the appropriate dashboard</li>
              <li>3. Use "Test Auth State" to check console logs</li>
              <li>4. Use "Clear Auth State" to reset</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}