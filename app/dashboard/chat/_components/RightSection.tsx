
export default function RightSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 bg-base-100 rounded-lg shadow-xl">{children}</div>
  );
}
