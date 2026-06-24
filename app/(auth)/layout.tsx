export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
