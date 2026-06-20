export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-nav">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="sku-card p-5 text-sm leading-relaxed flex flex-col gap-4" style={{ color: 'var(--text-muted)' }}>
        <p><strong style={{ color: 'var(--text)' }}>Data We Collect:</strong> When you register, we collect your name, IP address, delivery address, and how you found us. This data is stored securely and never shared with third parties.</p>
        <p><strong style={{ color: 'var(--text)' }}>Order Data:</strong> When you place an order, your name, phone number, and address are shared via WhatsApp with the store owner for delivery purposes.</p>
        <p><strong style={{ color: 'var(--text)' }}>Push Notifications:</strong> With your permission, we send order status notifications through your browser. You can disable these at any time in your browser settings.</p>
        <p><strong style={{ color: 'var(--text)' }}>Cookies & Local Storage:</strong> We use browser local storage to save your cart, wishlist, and preferences. No tracking cookies are used.</p>
        <p><strong style={{ color: 'var(--text)' }}>Contact:</strong> For privacy concerns, contact us through the About page.</p>
      </div>
    </div>
  )
}
