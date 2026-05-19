'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { slideInRight } from '@/lib/animations'

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, discountAmount, couponCode } =
    useCartStore()
  const total = subtotal() - discountAmount

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-50"
          />
          {/* Drawer */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-base">Tu carrito ({items.length})</h2>
              <button onClick={closeCart} className="p-1 hover:opacity-60 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                <ShoppingBag size={48} strokeWidth={1} />
                <p className="text-sm">Tu carrito está vacío</p>
                <button
                  onClick={closeCart}
                  className="text-sm font-medium underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Seguir comprando
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.cartKey} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 leading-tight">{item.name}</p>
                        {(item.variants ?? []).length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {(item.variants ?? []).map(v => v.optionName).join(' · ')}
                          </p>
                        )}
                        <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => updateQty(item.cartKey, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.cartKey, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4 space-y-3">
                  {couponCode && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento ({couponCode})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total estimado</span>
                    <span>{formatPrice(Math.max(0, total))}</span>
                  </div>
                  <Link
                    href="/carrito"
                    onClick={closeCart}
                    className="block w-full text-center py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Ver carrito y pagar
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
