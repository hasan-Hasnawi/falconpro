export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-8 bg-gray-100 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
        <div className="h-6 bg-gray-100 rounded w-24 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-20 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className={`h-4 bg-gray-100 rounded animate-pulse ${i === 0 ? 'w-20' : i === cols - 1 ? 'w-16' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100" />
            <div className="w-5 h-5 rounded bg-gray-100" />
          </div>
          <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}
