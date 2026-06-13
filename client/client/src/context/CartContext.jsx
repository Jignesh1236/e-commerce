import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('storeCart')) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('storeCart', JSON.stringify(items))
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product._id)
      if (existing) {
        return prev.map(i => i.productId === product._id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.discountPercent > 0
          ? Math.round(product.price * (1 - product.discountPercent / 100))
          : product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '',
        stock: product.stock,
        qty
      }]
    })
  }

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
