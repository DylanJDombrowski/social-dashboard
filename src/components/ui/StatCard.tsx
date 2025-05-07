import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  className = "",
}: StatCardProps) {
  // Format numbers over 1000 to include k suffix
  const formattedValue =
    typeof value === "number" && value >= 1000
      ? `${(value / 1000).toFixed(1)}k`
      : value;

  // Determine text color for change indicator
  const changeColor = change?.startsWith("+")
    ? "text-green-500"
    : change?.startsWith("-")
    ? "text-red-500"
    : "text-gray-500";

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 ${className}`}>
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formattedValue}
            </p>
            {change && (
              <p className={`ml-2 text-sm font-medium ${changeColor}`}>
                {change}
              </p>
            )}
          </div>
        </div>
        {icon && <div className="bg-blue-50 rounded-md p-2">{icon}</div>}
      </div>
    </div>
  );
}
