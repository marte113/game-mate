"use client";



export default function ProfileTabNav({}) {
  return (
    <section className="border-b mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <button
            className="pb-3 px-1 font-medium relative 
             text-primary
          "
          >
            프로필
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
          </button>
        </div>
      </div>
    </section>
  );
}
