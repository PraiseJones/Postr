import { cn } from "@/lib/utils";

export type ResultStatus = "pending" | "success" | "failed";

const styles: Record<ResultStatus, string> = {
  success: "bg-success/10 text-success border-success/20",
  failed: "bg-danger/10 text-danger border-danger/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export default function StatusBadge({ status }: { status: ResultStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
