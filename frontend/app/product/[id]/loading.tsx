export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          
          {/* Main content skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            
            {/* Details skeleton */}
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}