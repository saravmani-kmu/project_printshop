import { Check, Clock, Loader2 } from "lucide-react";
import type { OrderStatus, StatusHistory } from "../types";
import { clsx } from "clsx";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "inprogress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const stepIndex = (s: OrderStatus) => STEPS.findIndex((x) => x.key === s);

interface Props {
  currentStatus: OrderStatus;
  history: StatusHistory[];
}

export default function OrderStatusBar({ currentStatus, history }: Props) {
  const current = stepIndex(currentStatus);

  return (
    <div className="w-full">
      {/* Step bar */}
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          const future = idx > current;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line left */}
              {idx > 0 && (
                <div
                  className={clsx(
                    "absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2",
                    done || active ? "bg-primary-500" : "bg-gray-200"
                  )}
                />
              )}
              {/* Circle */}
              <div
                className={clsx(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  done && "bg-primary-600 border-primary-600 text-white",
                  active && "bg-white border-primary-600 text-primary-600",
                  future && "bg-white border-gray-200 text-gray-300"
                )}
              >
                {done ? (
                  <Check className="w-5 h-5" />
                ) : active ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              {/* Label */}
              <span
                className={clsx(
                  "mt-2 text-xs font-semibold text-center",
                  done && "text-primary-600",
                  active && "text-primary-700",
                  future && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline notes */}
      {history.length > 0 && (
        <div className="mt-6 space-y-3">
          {history.map((h) => (
            <div key={h.id} className="flex gap-3 items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">{h.status.replace("inprogress", "In Progress")}</p>
                {h.note && <p className="text-sm text-gray-500 mt-0.5">{h.note}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(h.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
