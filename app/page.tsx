import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="w-full">
      {/* Hero Section - Full Width */}
      <Hero />
      
      {/* Main Content - Constrained Width */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
        {/* Add your other home page content here if any */}
      </main>
    </div>
  );
}