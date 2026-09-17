export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#666666]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#111111] truncate">{value}</p>
        </div>
        {Icon ? (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
            <Icon className="w-5 h-5 text-brand" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
