'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tag } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

type ShippingMethod = {
  id: string
  name: string
  description: string | null
  type: string
  price: number
}

type PaymentMethod = {
  id: string
  type: string
  label: string
  details: string | null
}

type Props = {
  shippingMethods: ShippingMethod[]
  paymentMethods: PaymentMethod[]
  tenantName: string
  customerPrefill: { name: string; lastName: string; email: string; phone: string; address: string } | null
}

export default function CheckoutForm({ shippingMethods, paymentMethods, tenantName, customerPrefill }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, subtotal, discountAmount, couponCode, setCoupon, clearCoupon, clearCart } = useCartStore()

  const [form, setForm] = useState({
    name: '', lastName: '', email: '', phone: '',
    company: '', address: '', city: '', rucCi: '',
  })
  const [saveData, setSaveData] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]?.id ?? '')
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.id ?? '')
  const [sameBilling, setSameBilling] = useState(true)
  const [billing, setBilling] = useState({ address: '', city: '' })
  const [couponInput, setCouponInput] = useState(couponCode)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const notes = searchParams.get('notes') ?? ''

  useEffect(() => {
    if (customerPrefill) {
      setForm((f) => ({ ...f, ...customerPrefill }))
      return
    }
    try {
      const saved = localStorage.getItem('checkout-saved-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm((f) => ({ ...f, ...parsed }))
        setSaveData(true)
      }
    } catch { /* ignore */ }
  }, [])

  const sub = subtotal()
  const shipping = shippingMethods.find((s) => s.id === selectedShipping)
  const shippingPrice = shipping?.price ?? 0
  const total = Math.max(0, sub - discountAmount + shippingPrice)

  const paymentInfo = paymentMethods.find((p) => p.id === selectedPayment)

  function setField(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!items.length) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          guestName: `${form.name} ${form.lastName}`.trim(),
          guestEmail: form.email,
          guestPhone: form.phone,
          deliveryAddress: shipping?.type === 'delivery' ? form.address : null,
          deliveryCity: shipping?.type === 'delivery' ? form.city : null,
          billingAddress: sameBilling ? form.address : billing.address,
          rucCi: form.rucCi,
          shippingMethodId: selectedShipping,
          paymentMethod: paymentInfo?.label,
          couponCode: couponCode || null,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al procesar el pedido'); return }
      if (saveData) {
        localStorage.setItem('checkout-saved-data', JSON.stringify({
          name: form.name, lastName: form.lastName, email: form.email,
          phone: form.phone, company: form.company, address: form.address,
          city: form.city, rucCi: form.rucCi,
        }))
      } else {
        localStorage.removeItem('checkout-saved-data')
      }
      clearCart()
      router.push(`/pedido/${data.orderNumber}`)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Tu carrito está vacío.</p>
        <a href="/productos" className="text-sm underline mt-2 block" style={{ color: 'var(--color-primary)' }}>Ir a productos</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left col */}
        <div className="space-y-6">
          {/* Contacto */}
          <section className="bg-white rounded-2xl p-5 border">
            <h2 className="font-bold text-base mb-4">Contacto</h2>
            <input
              type="email"
              placeholder="Email o número de teléfono móvil"
              required
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </section>

          {/* Entrega */}
          <section className="bg-white rounded-2xl p-5 border">
            <h2 className="font-bold text-base mb-4">Entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Nombre', required: true },
                { key: 'lastName', label: 'Apellidos', required: true },
              ].map(({ key, label, required }) => (
                <input
                  key={key}
                  placeholder={label}
                  required={required}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setField(key, e.target.value)}
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              ))}
            </div>
            <div className="mt-3 space-y-3">
              <input
                placeholder="Empresa (opcional)"
                value={form.company}
                onChange={(e) => setField('company', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <input
                placeholder="Dirección"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="RUC / CI (sin guión)"
                  value={form.rucCi}
                  onChange={(e) => setField('rucCi', e.target.value)}
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  placeholder="Ciudad"
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <input
                type="tel"
                placeholder="Teléfono"
                required
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            {!customerPrefill && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveData}
                  onChange={(e) => setSaveData(e.target.checked)}
                  className="rounded accent-[var(--color-primary)] w-4 h-4"
                />
                <span className="text-sm text-gray-600">Guardar mis datos para futuras compras</span>
              </label>
            )}
          </section>

          {/* Métodos de envío */}
          <section className="bg-white rounded-2xl p-5 border">
            <h2 className="font-bold text-base mb-4">Métodos de envío</h2>
            <div className="space-y-2">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedShipping === method.id ? 'border-[var(--color-primary)] bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={selectedShipping === method.id}
                      onChange={() => setSelectedShipping(method.id)}
                      className="accent-[var(--color-primary)]"
                    />
                    <div>
                      <p className="text-sm font-medium">{method.name}</p>
                      {method.description && <p className="text-xs text-gray-500">{method.description}</p>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold shrink-0 ml-2">
                    {method.price === 0 ? 'GRATIS' : formatPrice(method.price)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Pago */}
          <section className="bg-white rounded-2xl p-5 border">
            <h2 className="font-bold text-base mb-1">Pago</h2>
            <p className="text-xs text-gray-400 mb-4">Todas las transacciones son seguras y están encriptadas.</p>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id}>
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPayment === method.id ? 'border-[var(--color-primary)] bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="accent-[var(--color-primary)]"
                    />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                  {selectedPayment === method.id && method.details && (
                    <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                      {method.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Dirección de facturación */}
          <section className="bg-white rounded-2xl p-5 border">
            <h2 className="font-bold text-base mb-4">Dirección de facturación</h2>
            <div className="space-y-2">
              {[
                { val: true, label: 'La misma dirección de envío' },
                { val: false, label: 'Usar una dirección de facturación distinta' },
              ].map(({ val, label }) => (
                <label key={String(val)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${sameBilling === val ? 'border-[var(--color-primary)] bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    checked={sameBilling === val}
                    onChange={() => setSameBilling(val)}
                    className="accent-[var(--color-primary)]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            {!sameBilling && (
              <div className="mt-3 space-y-3">
                <input
                  placeholder="Dirección de facturación"
                  value={billing.address}
                  onChange={(e) => setBilling((b) => ({ ...b, address: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  placeholder="Ciudad"
                  value={billing.city}
                  onChange={(e) => setBilling((b) => ({ ...b, city: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            )}
          </section>

          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !selectedShipping || !selectedPayment}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {submitting ? 'Procesando...' : 'Finalizar el pedido'}
          </button>
          <p className="text-xs text-center text-gray-400">Todos los derechos reservados — {tenantName}</p>
        </div>

        {/* Right col — Order summary (sticky) */}
        <div className="md:sticky md:top-20 space-y-4">
          <div className="bg-white rounded-2xl border p-5">
            <h3 className="font-bold text-sm mb-4">Tu pedido</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon in summary */}
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Código de regalo"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  disabled={!!couponCode}
                  className="w-full pl-8 pr-2 py-2 rounded-lg border text-xs focus:outline-none focus:border-[var(--color-primary)] disabled:bg-gray-50"
                />
              </div>
              {couponCode ? (
                <button type="button" onClick={() => { clearCoupon(); setCouponInput('') }} className="px-2 py-1.5 rounded-lg border text-xs text-red-500">Quitar</button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  Aplicar
                </button>
              )}
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}

            <div className="mt-4 space-y-1.5 border-t pt-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span>Descuento</span><span>-{formatPrice(discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{shippingPrice === 0 ? 'GRATIS' : formatPrice(shippingPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
