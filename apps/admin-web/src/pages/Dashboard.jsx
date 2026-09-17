import { Link } from 'react-router-dom';
import {
  Briefcase,
  IndianRupee,
  Megaphone,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { humanize, formatNumber, formatValue, formatCurrency } from '../lib/format';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import { ErrorState, LoadingState } from '../components/StateViews';

const WANTED_STATS = [
  { keys: ['totalCustomers', 'customers', 'customerCount'], label: 'Customers', icon: Users },
  { keys: ['totalMerchants', 'merchants', 'merchantCount'], label: 'Merchants', icon: Briefcase },
  { keys: ['totalShops', 'shops', 'shopCount'], label: 'Shops', icon: Store },
  { keys: ['totalProducts', 'products', 'productCount'], label: 'Products', icon: Package },
  { keys: ['totalOrders', 'orders', 'orderCount'], label: 'Orders', icon: ShoppingCart },
  {
    keys: ['pendingVerifications', 'pending_verifications', 'pendingShopVerifications', 'shopVerificationsPending'],
    label: 'Pending Shop Verifications',
    icon: ShieldCheck,
    link: '/shop-verifications',
  },
  {
    keys: ['pendingProducts', 'pending_product_approvals', 'pendingProductApprovals', 'productsPendingApproval'],
    label: 'Pending Product Approvals',
    icon: PackageCheck,
    link: '/product-approvals',
  },
  { keys: ['totalRevenue', 'revenue', 'totalPayments', 'totalSales'], label: 'Revenue', icon: IndianRupee, currency: true },
  { keys: ['totalCreators', 'creators', 'creatorCount'], label: 'Creators', icon: Sparkles },
  { keys: ['totalCampaigns', 'campaigns', 'campaignCount', 'activeCampaigns'], label: 'Campaigns', icon: Megaphone },
];

export default function Dashboard() {
  const { loading, data, error, refetch } = useApiData(() => api.get(ENDPOINTS.ADMIN.DASHBOARD), []);

  const root = (!loading && !error ? unwrap(data) : null) ?? {};
  const cards = buildCards(root);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Platform overview across shops, merchants, customers and moderation queues"
        actions={
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />
      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : error ? (
        <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-10 text-center text-sm text-[#666666]">
          No dashboard statistics were returned by the API.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {cards.map((card) =>
            card.link ? (
              <Link key={card.label} to={card.link} className="rounded-2xl card-shadow-hover focus:outline-none focus:ring-2 focus:ring-[#138A36]">
                <StatCard icon={card.icon} label={card.label} value={card.value} />
              </Link>
            ) : (
              <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function unwrap(payload) {
  return payload?.stats ?? payload?.data ?? (payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : null);
}

function buildCards(root) {
  if (!root || typeof root !== 'object') return [];
  const cards = [];
  const used = new Set();

  for (const wanted of WANTED_STATS) {
    const key = wanted.keys.find((k) => isStatValue(root[k]));
    if (!key) continue;
    used.add(key);
    cards.push({
      label: wanted.label,
      icon: wanted.icon,
      link: wanted.link,
      value: wanted.currency ? formatCurrency(root[key]) : formatNumber(root[key]),
    });
  }

  for (const [key, value] of Object.entries(root)) {
    if (used.has(key) || !isStatValue(value)) continue;
    cards.push({ label: humanize(key), icon: null, value: formatValue(value) });
  }

  return cards;
}

function isStatValue(value) {
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (typeof value !== 'string' || value.trim() === '') return false;
  return !Number.isNaN(Number(value));
}
