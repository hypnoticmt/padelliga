// app/(auth-pages)/layout.tsx or your layout file
export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Changed from max-w-7xl to w-full to allow hero to be full-width
    <div className="w-full flex flex-col gap-12 items-start">
      {children}
    </div>
  );
}