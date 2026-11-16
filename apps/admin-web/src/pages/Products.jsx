import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatCurrency, formatDate } from '../lib/format';
import { supabase, uploadProductImage } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';

const PAGE_SIZE = 15;

const AVAILABILITY_OPTIONS = ['In Stock', 'Low Stock', 'Out of Stock'];

export default function Products() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const availability = searchParams.get('availability') || searchParams.get('availabilityStatus') || '';
  const categoryId = searchParams.get('category') || searchParams.get('categoryId') || '';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState(q);

  useEffect(() => {
    setSearchVal(q);
  }, [q]);

  function updateSearchParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next, { replace: true });
  }

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Load categories
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        const list = res?.categories || (Array.isArray(res) ? res : []);
        if (list.length > 0) setCategories(list);
      })
      .catch(() => {});
  }, []);

  // Load products
  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get('/admin/products', {
        query: {
          q: q.trim() || undefined,
          categoryId: categoryId || undefined,
          availabilityStatus: availability || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [page, q, categoryId, availability]
  );

  // Realtime synchronization on products
  useEffect(() => {
    const channel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  function openAddModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(prod) {
    setEditingProduct(prod);
    setIsModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast('Product deleted successfully');
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast(err?.message || 'Failed to delete product', 'error');
      throw err;
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((p) => p.id));
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleBatchDelete() {
    if (selectedIds.length === 0) return;
    setIsDeletingBatch(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => api.delete(`/products/${id}`))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      toast(`Successfully deleted ${successful} of ${selectedIds.length} products`);
      setSelectedIds([]);
      setIsBatchDeleteModalOpen(false);
      refetch();
    } catch (err) {
      toast(err?.message || 'Failed to batch delete products', 'error');
      throw err;
    } finally {
      setIsDeletingBatch(false);
    }
  }

  async function handleToggleFeatured(prod) {
    try {
      await api.put(`/products/${prod.id}`, { isFeatured: !prod.is_featured });
      toast(prod.is_featured ? 'Removed from featured' : 'Marked as featured');
      refetch();
    } catch (err) {
      toast(err?.message || 'Failed to update featured status', { variant: 'error' });
    }
  }

  async function handleToggleStock(prod) {
    const nextStatus = prod.availability_status === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      await api.patch(`/products/${prod.id}/stock`, { availabilityStatus: nextStatus });
      toast(`Stock status updated to ${nextStatus}`);
      refetch();
    } catch (err) {
      toast(err?.message || 'Failed to update stock status', { variant: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your store catalog: add, edit, price, and update stock for all products."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C] shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        }
      />

      {/* Filters bar */}
      <div className="bg-white border border-[#E5E7E5] rounded-2xl p-4 card-shadow flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateSearchParam('q', searchVal.trim());
              }
            }}
            onBlur={() => {
              if (searchVal.trim() !== q) {
                updateSearchParam('q', searchVal.trim());
              }
            }}
            placeholder="Search products by name or description (press Enter)…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] bg-[#F7F8F7] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryId}
            onChange={(e) => updateSearchParam('category', e.target.value)}
            className="w-full md:w-48 py-2 px-3 text-sm rounded-xl border border-[#E5E7E5] bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(e) => updateSearchParam('availability', e.target.value)}
            className="w-full md:w-36 py-2 px-3 text-sm rounded-xl border border-[#E5E7E5] bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          >
            <option value="">All Stock</option>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingState label="Loading product catalog…" />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error.message} onRetry={refetch} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg text-[#111111]">No products found</h3>
            <p className="text-sm text-[#666666] mt-1 max-w-sm mx-auto">
              {q || categoryId || availability
                ? 'Try clearing your search or category filters to find products.'
                : 'Your catalog is empty. Click "+ Add Product" above to list your first product.'}
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C]"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7F8F7] border-b border-[#E5E7E5] text-[#666666] font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selectedIds.length === items.length}
                        onChange={toggleSelectAll}
                        title="Select all products on page"
                        className="w-4 h-4 text-brand rounded border-[#CCCCCC] focus:ring-brand cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E5]">
                  {items.map((prod) => {
                    const price = Number(prod.price) || 0;
                    const origPrice = Number(prod.original_price) || 0;
                    const discount =
                      origPrice > price
                        ? Math.round(((origPrice - price) / origPrice) * 100)
                        : null;
                    const isInStock = prod.availability_status === 'In Stock';
                    const isSelected = selectedIds.includes(prod.id);

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-[#FBFDFB] transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(prod.id)}
                            className="w-4 h-4 text-brand rounded border-[#CCCCCC] focus:ring-brand cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#F0F2F0] border border-[#E5E7E5] overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.image_url ? (
                                <img
                                  src={prod.image_url}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-[#999999]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#111111] truncate">{prod.name}</p>
                              <p className="text-xs text-[#666666] truncate max-w-xs">
                                {prod.description || 'No description provided'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#666666] whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-[#F0F2F0] text-[#444444]">
                            {prod.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#111111]">
                            {formatCurrency(price)}
                          </div>
                          {origPrice > price ? (
                            <div className="text-xs text-[#999999] line-through">
                              {formatCurrency(origPrice)}{' '}
                              {discount ? (
                                <span className="text-[#138A36] font-medium not-italic ml-1">
                                  ({discount}% OFF)
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#111111]">
                          <span className="font-medium">{prod.stock_quantity ?? 0}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(prod)}
                            title="Click to toggle stock status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                              isInStock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isInStock ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            />
                            {prod.availability_status || 'Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prod)}
                            title={prod.is_featured ? 'Remove from featured' : 'Mark as featured'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              prod.is_featured
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-[#CCCCCC] hover:text-amber-500 hover:bg-[#F0F2F0]'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${prod.is_featured ? 'fill-amber-500' : ''}`}
                            />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(prod)}
                              title="Edit product"
                              className="p-1.5 rounded-lg text-[#666666] hover:text-brand hover:bg-brand-light transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(prod)}
                              title="Delete product"
                              className="p-1.5 rounded-lg text-[#666666] hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 ? (
              <div className="p-4 border-t border-[#E5E7E5]">
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onChange={(p) => {
                    setPage(p);
                    updateSearchParam('page', p);
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#111111] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
              {selectedIds.length}
            </span>
            <span>products selected</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setIsBatchDeleteModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected ({selectedIds.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-[#AAAAAA] hover:text-white transition-colors"
          >
            Deselect All
          </button>
        </div>
      ) : null}

      {/* Product Form Modal (Add / Edit) */}
      {isModalOpen ? (
        <ProductModal
          isOpen={isModalOpen}
          initialData={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onDelete={(prod) => {
            setIsModalOpen(false);
            setDeleteTarget(prod);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      ) : null}

      {/* Single Delete Confirmation Modal */}
      {deleteTarget ? (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          isOpen={Boolean(deleteTarget)}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          description={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete Product"
          tone="danger"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}

      {/* Batch Delete Confirmation Modal */}
      {isBatchDeleteModalOpen ? (
        <ConfirmModal
          open={isBatchDeleteModalOpen}
          isOpen={isBatchDeleteModalOpen}
          title={`Delete ${selectedIds.length} Products`}
          message={`Are you sure you want to permanently delete these ${selectedIds.length} selected products? This action cannot be undone.`}
          description={`Are you sure you want to permanently delete these ${selectedIds.length} selected products? This action cannot be undone.`}
          confirmLabel={isDeletingBatch ? 'Deleting…' : `Delete ${selectedIds.length} Products`}
          tone="danger"
          danger
          onClose={() => setIsBatchDeleteModalOpen(false)}
          onConfirm={handleBatchDelete}
        />
      ) : null}
    </div>
  );
}

/**
 * Add / Edit Product Modal Form
 */
function ProductModal({ isOpen, initialData, categories, onClose, onDelete, onSuccess }) {
  const toast = useToast();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || categories[0]?.id || ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.original_price ? String(initialData.original_price) : ''
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stock_quantity !== undefined ? String(initialData.stock_quantity) : '10'
  );
  const [availabilityStatus, setAvailabilityStatus] = useState(
    initialData?.availability_status || 'In Stock'
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));

  // Image handling
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || '');

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-calculated discount percentage
  const numPrice = Number(price) || 0;
  const numOrigPrice = Number(originalPrice) || 0;
  const discountPercent =
    numOrigPrice > numPrice && numPrice > 0
      ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
      : null;

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);
    setFormError('');

    try {
      const uploadedUrl = await uploadProductImage(file);
      setImageUrl(uploadedUrl);
      setImagePreview(uploadedUrl);
      toast('Image uploaded to Supabase Storage');
    } catch (err) {
      console.error('Upload failed, falling back to data URL:', err);
      // Fallback to data URL so the image still saves with the product
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target.result;
        setImageUrl(dataUri);
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
      toast('Local image attached to product');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setFormError('Product name must be at least 2 characters');
      return;
    }

    const cleanPrice = Number(price);
    if (!cleanPrice || cleanPrice <= 0) {
      setFormError('Please enter a valid price greater than ₹0');
      return;
    }

    const payload = {
      name: cleanName,
      categoryId: categoryId || undefined,
      description: description.trim() || undefined,
      price: cleanPrice,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      availabilityStatus,
      isFeatured,
      images: imageUrl ? [imageUrl] : [],
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/products/${initialData.id}`, payload);
        toast('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast('Product added to catalog!');
      }
      onSuccess();
    } catch (err) {
      setFormError(err?.message || 'Failed to save product. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E7E5] flex items-center justify-between shrink-0 bg-[#F7F8F7]">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-[#666666]">
              {isEditing
                ? 'Update product details, pricing, and inventory'
                : 'Fill in details to list a new product in the store'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#666666] hover:text-[#111111] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          ) : null}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Kashmiri Saffron 1g, Fresh Farm Milk 1L"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {/* Category & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
                Stock Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & MRP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="499.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-semibold text-brand-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
                Original MRP (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="999.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
              {discountPercent ? (
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                  🎉 {discountPercent}% Discount applied
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product quality, origin, weight, or special benefits…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {/* Product Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                Product Image
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    imageTab === 'upload'
                      ? 'bg-brand text-white'
                      : 'text-[#666666] hover:bg-[#F0F2F0]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                    imageTab === 'url'
                      ? 'bg-brand text-white'
                      : 'text-[#666666] hover:bg-[#F0F2F0]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageTab === 'upload' ? (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D5D8D5] rounded-xl hover:border-brand bg-[#FBFDFB] cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadingImage ? (
                  <div className="flex items-center gap-2 text-sm text-brand font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading to Supabase Storage…</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Upload className="w-6 h-6 text-[#999999] mb-1" />
                    <span className="text-sm font-semibold text-[#111111]">
                      Click to upload image file
                    </span>
                    <span className="text-xs text-[#999999] mt-0.5">
                      PNG, JPG, or WEBP up to 10MB
                    </span>
                  </div>
                )}
              </label>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            )}

            {/* Preview Box */}
            {imagePreview ? (
              <div className="flex items-center gap-3 p-2 bg-[#F7F8F7] rounded-xl border border-[#E5E7E5]">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-[#E5E7E5] bg-white shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#111111]">Image attached</p>
                  <p className="text-[11px] text-[#666666] truncate">{imageUrl || 'Local file'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImagePreview('');
                  }}
                  className="p-1 text-[#999999] hover:text-red-600 rounded-lg"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Featured Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E7E5] bg-[#FBFDFB] cursor-pointer hover:bg-[#F7F8F7]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand rounded focus:ring-brand"
              />
              <div>
                <span className="text-sm font-semibold text-[#111111]">
                  Feature this product on homepage
                </span>
                <p className="text-xs text-[#666666]">
                  Displays this product in the featured carousel and trending discovery sections.
                </p>
              </div>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#E5E7E5] flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={() => onDelete?.(initialData)}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Product
              </button>
            ) : <div />}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-[#E5E7E5] text-sm font-medium text-[#444444] hover:bg-[#F7F8F7] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Product…
                  </>
                ) : isEditing ? (
                  'Update Product'
                ) : (
                  'Add Product to Store'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
