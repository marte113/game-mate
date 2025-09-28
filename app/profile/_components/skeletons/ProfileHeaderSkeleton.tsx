"use client"

export default function ProfileHeaderSkeleton() {
  return (
    <section className="relative">
      <div className="relative w-full h-48 md:h-64 lg:h-80 bg-base-300 animate-pulse"></div>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-base-100 bg-base-300 animate-pulse"></div>
          <div className="flex-1 pt-2 md:pt-16">
            <div className="h-8 bg-base-300 rounded w-1/2 mb-2 animate-pulse"></div>
            <div className="h-4 bg-base-300 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
