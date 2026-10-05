import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary';
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return 'border-l-emerald-600';
      case 'danger':
        return 'border-l-rose-600';
      case 'warning':
        return 'border-l-amber-500';
      case 'primary':
        return 'border-l-blue-600';
      default:
        return 'border-l-slate-400';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-emerald-700 bg-emerald-50';
      case 'danger':
        return 'text-rose-700 bg-rose-50';
      case 'warning':
        return 'text-amber-700 bg-amber-50';
      case 'primary':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-lg p-4 shadow-xs border-l-4 ${getBorderColor()} ${
        onClick ? 'cursor-pointer hover:border-slate-300 transition-all hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-slate-500 mt-1 tabular-nums truncate">
              {subValue}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span
                className={`font-semibold tabular-nums ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
              <span className="text-slate-400">vs previous period</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-md shrink-0 ${getIconColor()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
