export default function TermsOfService() {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-nav">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <div className="sku-card p-5 text-sm leading-relaxed flex flex-col gap-4" style={{ color: 'var(--text-muted)' }}>
        <p><strong style={{ color: 'var(--text)' }}>1. Use of Service:</strong> This platform is for personal, non-commercial use. By using it, you agree to provide accurate information.</p>
        <p><strong style={{ color: 'var(--text)' }}>2. Orders:</strong> Orders are placed via WhatsApp and payment is collected by the store owner directly via UPI. We do not process payments on this platform.</p>
        <p><strong style={{ color: 'var(--text)' }}>3. Cancellation:</strong> Orders can be cancelled by contacting the store owner directly via WhatsApp before dispatch.</p>
        <p><strong style={{ color: 'var(--text)' }}>4. Prices:</strong> All prices are in Indian Rupees (₹) and may change without prior notice.</p>
        <p><strong style={{ color: 'var(--text)' }}>5. Reviews:</strong> Reviews may only be submitted by verified buyers (delivered orders). We reserve the right to remove inappropriate content.</p>
        <p><strong style={{ color: 'var(--text)' }}>6. Liability:</strong> We are not liable for delays caused by circumstances beyond our control.</p>
      </div>
    </div>
  )
}
