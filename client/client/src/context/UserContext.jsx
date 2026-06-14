import { createContext, useContext, useState } from 'react'
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

  const loginByNamePhone = async ({ name, phone }) => {
    const res = await api.post('/users/login-by-name-phone', { name, phone })
    setUser(res.data.user)
    localStorage.setItem('storeUser', JSON.stringify(res.data.user))
    return res.data.user
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('storeUser', JSON.stringify(updatedUser))
  }

  const syncUserFromOrder = async (address) => {
    if (!user?._id) return
    try {
      const phone = address?.phone ? String(address.phone).replace(/\D/g, '').slice(-10) : ''
      const fullAddress = address?.fullAddress
        ? [address.fullAddress, address.landmark, address.pincode].filter(Boolean).join(', ')
        : ''
      const update = {}
      if (phone) update.phone = phone
      if (fullAddress) update.address = fullAddress

      if (Object.keys(update).length === 0) return

      const res = await api.put(`/users/${user._id}`, update)
      if (res.data.user) {
        setUser(res.data.user)
        localStorage.setItem('storeUser', JSON.stringify(res.data.user))
      }
    } catch {}
  }

  return (
    <UserContext.Provider value={{ user, loading, checkIP, onboard, loginByNamePhone, updateUser, syncUserFromOrder }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
