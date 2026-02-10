// app/(auth-pages)/layout.tsx

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 flex items-center justify-center px-5 pt-10 pb-24">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
