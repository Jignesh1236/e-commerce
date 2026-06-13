import { useEffect, useState } from 'react'
import api from '../utils/api'
import { FiInstagram, FiFacebook, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'

export default function About() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    api.get('/config').then(r => setConfig(r.data.config || r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4 pb-nav">
      <h1 className="text-2xl font-bold mb-6">About Us</h1>

      <div className="sku-card p-5 mb-4">
        <h2 className="font-bold text-lg mb-2">Our Story</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {config?.aboutUs || 'Welcome to our store! We bring you the freshest products at the best prices.'}
        </p>
      </div>

      {config?.contactInfo && (
        <div className="sku-card p-5 mb-4">
          <h2 className="font-bold text-lg mb-3">Contact Us</h2>
          <div className="flex flex-col gap-3 text-sm">
            {config.contactInfo.phone && (
              <a href={`tel:${config.contactInfo.phone}`} className="flex items-center gap-3" style={{ color: 'var(--text)' }}>
                <FiPhone style={{ color: 'var(--primary)' }} /> {config.contactInfo.phone}
              </a>
            )}
            {config.contactInfo.email && (
              <a href={`mailto:${config.contactInfo.email}`} className="flex items-center gap-3" style={{ color: 'var(--text)' }}>
                <FiMail style={{ color: 'var(--primary)' }} /> {config.contactInfo.email}
              </a>
            )}
            {config.contactInfo.address && (
              <p className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                {config.contactInfo.address}
              </p>
            )}
          </div>
        </div>
      )}

      {config?.storeTiming && (
        <div className="sku-card p-5 mb-4">
          <h2 className="font-bold text-lg mb-3">Store Timings</h2>
          <div className="flex items-center gap-3 text-sm">
            <FiClock style={{ color: 'var(--primary)' }} />
            <div>
              <p className="font-medium">{config.storeTiming.days || 'Mon – Sat'}</p>
              <p style={{ color: 'var(--text-muted)' }}>{config.storeTiming.open} – {config.storeTiming.close}</p>
            </div>
          </div>
        </div>
      )}

      {(config?.socialLinks?.instagram || config?.socialLinks?.facebook) && (
        <div className="sku-card p-5">
          <h2 className="font-bold text-lg mb-3">Follow Us</h2>
          <div className="flex gap-3">
            {config.socialLinks.instagram && (
              <a href={config.socialLinks.instagram} target="_blank" rel="noreferrer" className="sku-btn-outline px-4 py-2 text-sm">
                <FiInstagram /> Instagram
              </a>
            )}
            {config.socialLinks.facebook && (
              <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="sku-btn-outline px-4 py-2 text-sm">
                <FiFacebook /> Facebook
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
