'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, discountAmount, couponCode, setCoupon, clearCoupon } =
    useCartStore()
  const [couponInput, setCouponInput] = useState(couponCode)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const sub = subtotal()
  const total = Math.max(0, sub - discountAmount)

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: sub }),
      })
      const data = await res.json()
      if (!res.ok) { setCouponError(data.error); return }
      setCoupon(data.code, data.discount)
    } catch {
      setCouponError('Error al validar cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-xl">Tu carrito está vacío</p>
        <Link href="/productos" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
          Seguir comprando
        </Link>
      </main>
    )
  }

  return (
    <>
      <main className="pt-14 md:pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Tu carrito</h1>
            <Link href="/productos" className="text-sm hover:underline text-gray-500">
              ← Seguir comprando
            </Link>
          </div>

          {/* Items */}
          <div className="border rounded-2xl overflow-hidden mb-6">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <span>Producto</span>
              <span className="text-center">Cantidad</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.productId} className="p-4 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/productos/${item.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-center">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="font-bold text-sm sm:text-right">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Instrucciones especiales del pedido</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indicaciones especiales, referencias de entrega, etc."
              rows={3}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          {/* Summary */}
          <div className="border rounded-2xl p-5 space-y-3">
            {/* Coupon */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Código de descuento"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  disabled={!!couponCode}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-[var(--color-primary)] disabled:bg-gray-50"
                />
              </div>
              {couponCode ? (
                <button onClick={() => { clearCoupon(); setCouponInput('') }} className="px-3 py-2 rounded-lg border text-sm text-red-500 hover:bg-red-50 transition-colors">
                  Quitar
                </button>
              ) : (
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              )}
            </div>
            {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            {couponCode && <p className="text-xs text-green-600">✓ Cupón {couponCode} aplicado — -{formatPrice(discountAmount)}</p>}

            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span>Descuento</span><span>-{formatPrice(discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-sm text-gray-500"><span>Envío</span><span>Calculado al pagar</span></div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total estimado</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href={`/checkout?notes=${encodeURIComponent(notes)}`}
              className="block w-full text-center py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Pagar pedido →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
