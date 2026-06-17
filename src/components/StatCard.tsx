import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
};

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-green-600">{trend}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>
  );
}
