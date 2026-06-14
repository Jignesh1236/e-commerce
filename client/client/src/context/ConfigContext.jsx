import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const ConfigContext = createContext({})

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/config')
      .then(r => setConfig(r.data.config || r.data || {}))
      .catch(() => setConfig({}))
      .finally(() => setLoading(false))
  }, [])

  const refetch = () => {
    api.get('/config')
      .then(r => setConfig(r.data.config || r.data || {}))
      .catch(() => {})
  }

  return (
    <ConfigContext.Provider value={{ config, loading, refetch }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)
