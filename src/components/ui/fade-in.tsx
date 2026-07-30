import { cn } from "@/lib/utils";

// 200ms ease-out entry fade — pure CSS so content is painted immediately
// with the server response instead of waiting for JS hydration.
export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-in", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
