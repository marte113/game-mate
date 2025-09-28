"use client"

export default function ProfileMainContentSkeleton() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          {/* Tab Nav Placeholder */}
          <div className="h-10 bg-base-300 rounded w-1/4 mb-8"></div>
          {/* Content Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="h-48 bg-base-300 rounded"></div>
              <div className="h-24 bg-base-300 rounded"></div>
              <div className="h-32 bg-base-300 rounded"></div>
            </div>
            <div className="md:col-span-2 space-y-8">
              <div className="h-24 bg-base-300 rounded"></div>
              <div className="h-48 bg-base-300 rounded"></div>
              <div className="h-64 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
