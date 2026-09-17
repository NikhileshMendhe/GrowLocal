import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@growlocal/ui';
import { Loader2, Minus, Plus, Store, Truck } from 'lucide-react';
import { ENDPOINTS, api } from '../lib/apiClient';
import { formatMoney } from '../lib/format';
import { useToast } from '../context/ToastContext.jsx';

export default function BuyNowModal({ open, onClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  if (!product) return null;

  const maxQty = Math.max(1, Math.min(product.stock_quantity || 1, 99));

  async function placeOrder() {
    setError('');
    setSubmitting(true);
    try {
      const data = await api.post(ENDPOINTS.ORDERS.CREATE, {
        productId: product.id,
        quantity,
        fulfillmentType,
        ...(fulfillmentType === 'delivery' && deliveryAddress.trim()
          ? { deliveryAddress: deliveryAddress.trim() }
          : {}),
      });
      toast('Order placed! The shop will confirm shortly.');
      onClose();
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      setError(err.message || 'Could not place the order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title="Place order"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting || (fulfillmentType === 'delivery' && deliveryAddress.trim().length < 5)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Confirm {formatMoney(Number(product.price) * quantity)}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl p-3">
          <div className="w-12 h-12 rounded-lg bg-brand-light flex items-center justify-center text-sm font-bold text-brand">
            {product.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111111] truncate">{product.name}</p>
            <p className="text-xs text-[#666666] truncate">{product.shop_name}</p>
          </div>
          <span className="ml-auto text-sm font-bold text-[#111111]">
            {formatMoney(product.price)}
          </span>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Quantity
          </label>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg border border-[#E5E7E5] bg-white flex items-center justify-center hover:border-brand"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="w-9 h-9 rounded-lg border border-[#E5E7E5] bg-white flex items-center justify-center hover:border-brand"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#666666]">
              {product.availability_status} · {product.stock_quantity ?? '—'} left
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Fulfillment
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setFulfillmentType('pickup')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${
                fulfillmentType === 'pickup'
                  ? 'border-brand bg-brand-light text-brand-dark'
                  : 'border-[#E5E7E5] bg-white text-[#666666]'
              }`}
            >
              <Store className="w-4 h-4" /> Pick up at shop
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType('delivery')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${
                fulfillmentType === 'delivery'
                  ? 'border-brand bg-brand-light text-brand-dark'
                  : 'border-[#E5E7E5] bg-white text-[#666666]'
              }`}
            >
              <Truck className="w-4 h-4" /> Delivery
            </button>
          </div>
        </div>

        {fulfillmentType === 'delivery' ? (
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              rows={3}
              placeholder="House / street / area, city, pincode"
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            {deliveryAddress.trim() && deliveryAddress.trim().length < 5 ? (
              <p className="text-xs text-amber-700 mt-1">
                Address must be at least 5 characters.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
