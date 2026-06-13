import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('storeUser')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const checkIP = async () => {
    try {
      setLoading(true)
      const res = await api.post('/users/check-ip')
      if (res.data.user) {
        setUser(res.data.user)
        localStorage.setItem('storeUser', JSON.stringify(res.data.user))
        return { exists: true, user: res.data.user }
      }
      return { exists: false }
    } catch {
      return { exists: false }
    } finally {
      setLoading(false)
    }
  }

  const onboard = async (data) => {
    const res = await api.post('/users/onboard', data)
    setUser(res.data.user)
    localStorage.setItem('storeUser', JSON.stringify(res.data.user))
    return res.data.user
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('storeUser', JSON.stringify(updatedUser))
  }

  return (
    <UserContext.Provider value={{ user, loading, checkIP, onboard, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
