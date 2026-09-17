import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import { Modal } from '@growlocal/ui';
import { Package, PackageX, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { api } from '../lib/apiClient';
import { APPROVAL_STATUS_META, AVAILABILITY_META, formatINR } from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader, Pagination, Tabs } from '../components/ui';

const PAGE_SIZE = 20;
const AVAILABILITY_OPTIONS = ['In Stock', 'Low Stock', 'Out of Stock'];

const initialFormState = {
  name: '',
  categoryId: '',
  price: '',
  originalPrice: '',
  stockQuantity: '10',
  availabilityStatus: 'In Stock',
  description: '',
  isFeatured: false,
};

function ProductForm({ form, setForm, categories }) {
  const inputClass =
    'px-3 py-2 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]';

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#111111]">Name</span>
        <input
          required
          minLength={2}
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="e.g. Cotton Kurta (Blue, XL)"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#111111]">Price (₹)</span>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={(event) => setField('price', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#111111]">Original price (₹)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => setField('originalPrice', event.target.value)}
            placeholder="optional"
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#111111]">Category</span>
          <select value={form.categoryId} onChange={(event) => setField('categoryId', event.target.value)} className={inputClass}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#111111]">Stock quantity</span>
          <input
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={(event) => setField('stockQuantity', event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#111111]">Availability</span>
        <select
          value={form.availabilityStatus}
          onChange={(event) => setField('availabilityStatus', event.target.value)}
          className={inputClass}
        >
          {AVAILABILITY_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#111111]">Description</span>
        <textarea
          rows={3}
          maxLength={5000}
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="What makes this product great?"
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) => setField('isFeatured', event.target.checked)}
          className="w-4 h-4 accent-[#138A36]"
        />
        <span className="text-xs font-semibold text-[#111111]">Feature this product</span>
      </label>
    </div>
  );
}

export default function Products() {
  const toast = useToast();
  const [shop, setShop] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [stockTarget, setStockTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [stockForm, setStockForm] = useState({ stockQuantity: '', availabilityStatus: 'In Stock' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let shopData = null;
      try {
        shopData = (await api.get(ENDPOINTS.MERCHANTS.MY_SHOP)).shop;
      } catch (err) {
        if (err.status !== 404) throw err;
      }
      setShop(shopData);
      const [productsData, categoriesData] = await Promise.all([
        api.get(ENDPOINTS.PRODUCTS.LIST, {
          query: {
            shopId: shopData?.id,
            q: activeQuery || undefined,
            limit: PAGE_SIZE,
            offset,
          },
        }),
        api.get(ENDPOINTS.CATEGORIES.LIST),
      ]);
      setRows(productsData.products);
      setTotal(productsData.total);
      setCategories(categoriesData.categories || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeQuery, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const shopId = shop?.id;

  useSocketEvent(SOCKET_EVENTS.PRODUCT_UPDATED, (product) => {
    if (!shopId || product.shop_id !== shopId) return;
    setRows((prev) => (prev ? prev.map((item) => (item.id === product.id ? product : item)) : prev));
  });

  useSocketEvent(SOCKET_EVENTS.PRODUCT_CREATED, (product) => {
    if (!shopId || product.shop_id !== shopId) return;
    setRows((prev) => {
      if (!prev || prev.some((item) => item.id === product.id)) return prev;
      if (offset !== 0) return prev;
      if (activeQuery && !`${product.name} ${product.description || ''}`.toLowerCase().includes(activeQuery.toLowerCase()))
        return prev;
      return [product, ...prev];
    });
    setTotal((prev) => prev + 1);
  });

  useSocketEvent(SOCKET_EVENTS.PRODUCT_DELETED, (product) => {
    if (!shopId || product.shop_id !== shopId) return;
    setRows((prev) => (prev ? prev.filter((item) => item.id !== product.id) : prev));
    setTotal((prev) => Math.max(0, prev - 1));
  });

  const visibleRows = useMemo(
    () => (rows || []).filter((p) => !availabilityFilter || p.availability_status === availabilityFilter),
    [rows, availabilityFilter]
  );

  function openCreate() {
    setForm(initialFormState);
    setCreateOpen(true);
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      categoryId: product.category_id || '',
      price: String(product.price),
      originalPrice: product.original_price !== null ? String(product.original_price) : '',
      stockQuantity: String(product.stock_quantity ?? 0),
      availabilityStatus: product.availability_status || 'In Stock',
      description: product.description || '',
      isFeatured: Boolean(product.is_featured),
    });
    setEditing(product);
  }

  function openStock(product) {
    setStockForm({
      stockQuantity: String(product.stock_quantity ?? 0),
      availabilityStatus: product.availability_status || 'In Stock',
    });
    setStockTarget(product);
  }

  async function submitCreate(event) {
    event.preventDefault();
    if (!shopId) return;
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.PRODUCTS.CREATE, {
        shopId,
        categoryId: form.categoryId || undefined,
        name: form.name.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice === '' ? undefined : Number(form.originalPrice),
        stockQuantity: Number(form.stockQuantity),
        availabilityStatus: form.availabilityStatus,
        description: form.description.trim() || undefined,
        isFeatured: form.isFeatured,
      });
      setCreateOpen(false);
      toast(`Product “${form.name.trim()}” created`);
      load();
    } catch (err) {
      toast(err.message || 'Could not create the product', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEdit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(ENDPOINTS.PRODUCTS.UPDATE(editing.id), {
        categoryId: form.categoryId || null,
        name: form.name.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
        stockQuantity: Number(form.stockQuantity),
        availabilityStatus: form.availabilityStatus,
        description: form.description.trim() || null,
        isFeatured: form.isFeatured,
      });
      setEditing(null);
      toast(`Product “${form.name.trim()}” updated`);
    } catch (err) {
      toast(err.message || 'Could not update the product', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitStock(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(ENDPOINTS.PRODUCTS.STOCK(stockTarget.id), {
        stockQuantity: Number(stockForm.stockQuantity),
        availabilityStatus: stockForm.availabilityStatus,
      });
      setStockTarget(null);
      toast(`Stock updated for “${stockTarget.name}”`);
    } catch (err) {
      toast(err.message || 'Could not update stock', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitDelete() {
    setSubmitting(true);
    try {
      await api.delete(ENDPOINTS.PRODUCTS.DELETE(deleting.id));
      setDeleting(null);
      toast(`Product “${deleting.name}” deleted`);
      setRows((prev) => (prev ? prev.filter((item) => item.id !== deleting.id) : prev));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast(err.message || 'Could not delete the product', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const modalFooter = (label, onSubmit, onClose) => (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-[#666666] hover:bg-[#F7F8F7]"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={label}
        disabled={submitting}
        className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Save'}
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Products</h1>
          <p className="text-sm text-[#666666] mt-0.5">
            {shop ? `${shop.name} · ${total} product${total === 1 ? '' : 's'}` : 'Your catalog'}
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!shopId}
          title={shopId ? undefined : 'You need a shop before adding products'}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setOffset(0);
            setActiveQuery(search.trim());
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your products…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
          />
        </form>
        <Tabs
          tabs={[
            { value: '', label: 'All stock' },
            { value: 'In Stock', label: 'In stock' },
            { value: 'Low Stock', label: 'Low stock' },
            { value: 'Out of Stock', label: 'Out of stock' },
          ]}
          value={availabilityFilter}
          onChange={setAvailabilityFilter}
        />
      </div>

      {loading ? (
        <PageLoader label="Loading products…" />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : shop === null ? (
        <EmptyState
          icon={PackageX}
          title="No shop linked to your account"
          description="Products belong to a shop. Once your shop is set up, your catalog lives here."
        />
      ) : !rows || visibleRows.length === 0 ? (
        <EmptyState
          icon={Package}
          title={activeQuery || availabilityFilter ? 'No products match' : 'No products yet'}
          description={
            activeQuery || availabilityFilter
              ? 'Try a different search or stock filter.'
              : 'Add your first product and it goes live for customers instantly.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visibleRows.map((product) => (
            <article key={product.id} className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#111111] truncate flex items-center gap-1.5">
                    {product.name}
                    {product.is_featured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                  </p>
                  <p className="text-xs text-[#666666] truncate">{product.category_name || 'No category'}</p>
                </div>
                <StatusBadge meta={APPROVAL_STATUS_META[product.approval_status]} />
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-[#111111]">{formatINR(product.price)}</p>
                {product.original_price !== null && product.original_price > product.price && (
                  <>
                    <p className="text-xs text-[#666666] line-through">{formatINR(product.original_price)}</p>
                    <p className="text-xs font-semibold text-brand">{product.discount_percentage}% off</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge meta={AVAILABILITY_META[product.availability_status]} />
                <span className="text-xs font-medium text-[#666666]">{product.stock_quantity} in stock</span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-1">
                <button
                  onClick={() => openEdit(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E5] text-xs font-semibold text-[#111111] hover:border-brand hover:text-brand"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => openStock(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E5] text-xs font-semibold text-[#111111] hover:border-brand hover:text-brand"
                >
                  <Package className="w-3.5 h-3.5" /> Stock
                </button>
                <button
                  onClick={() => setDeleting(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E5] text-xs font-semibold text-[#666666] hover:border-red-200 hover:text-red-600 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </article>
          ))}
          <div className="md:col-span-2 xl:col-span-3">
            <Pagination offset={offset} limit={PAGE_SIZE} total={total} onOffset={setOffset} />
          </div>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add product"
        footer={modalFooter('create-product-form', submitCreate, () => setCreateOpen(false))}
      >
        <form id="create-product-form" onSubmit={submitCreate} className="flex flex-col gap-3.5">
          <ProductForm form={form} setForm={setForm} categories={categories} />
        </form>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit “${editing?.name || ''}”`}
        footer={modalFooter('edit-product-form', submitEdit, () => setEditing(null))}
      >
        <form id="edit-product-form" onSubmit={submitEdit} className="flex flex-col gap-3.5">
          <ProductForm form={form} setForm={setForm} categories={categories} />
        </form>
      </Modal>

      <Modal
        open={Boolean(stockTarget)}
        onClose={() => setStockTarget(null)}
        title={`Adjust stock — ${stockTarget?.name || ''}`}
        footer={modalFooter('stock-form', submitStock, () => setStockTarget(null))}
      >
        <form id="stock-form" onSubmit={submitStock} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Stock quantity</span>
            <input
              required
              type="number"
              min="0"
              value={stockForm.stockQuantity}
              onChange={(event) => setStockForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Availability</span>
            <select
              value={stockForm.availabilityStatus}
              onChange={(event) => setStockForm((prev) => ({ ...prev, availabilityStatus: event.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
            >
              {AVAILABILITY_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete product"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              onClick={() => setDeleting(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#666666] hover:bg-[#F7F8F7]"
            >
              Keep product
            </button>
            <button
              onClick={submitDelete}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-[#666666]">
          Delete “{deleting?.name}”? Customers will no longer see it. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
