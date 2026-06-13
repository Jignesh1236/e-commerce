export function buildWhatsAppMessage({ user, address, items, total, deliveryCharge }) {
  const itemLines = items.map(i => `• ${i.name} x${i.qty} — ₹${i.price * i.qty}`).join('\n')
  const msg = `🛒 *New Order!*

👤 *Name:* ${address.name}
📞 *Phone:* ${address.phone}
📍 *Address:* ${address.fullAddress}${address.landmark ? ', ' + address.landmark : ''}, ${address.pincode}

🧾 *Order Details:*
${itemLines}

🚚 *Delivery Charge:* ₹${deliveryCharge}
💰 *Total:* ₹${total + deliveryCharge}`
  return msg
}

export function openWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
}
