import { cn } from "@/lib/utils";

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-zinc-900/50 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
