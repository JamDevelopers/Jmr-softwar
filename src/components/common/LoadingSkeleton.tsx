import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 8,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="h-11 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-slate-200 rounded-xs"
            style={{ width: `${Math.floor(100 / columns)}%` }}
          />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-12 px-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-slate-100 rounded-xs"
                style={{
                  width: `${Math.floor(100 / columns)}%`,
                  opacity: 0.5 + (c % 3) * 0.2,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 h-24">
          <div className="h-3 w-20 bg-slate-200 rounded-xs mb-3" />
          <div className="h-6 w-32 bg-slate-200 rounded-xs mb-2" />
          <div className="h-2.5 w-16 bg-slate-100 rounded-xs" />
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse h-72 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-32 bg-slate-200 rounded-xs" />
        <div className="h-4 w-20 bg-slate-100 rounded-xs" />
      </div>
      <div className="flex-1 flex items-end gap-3 pb-4 border-b border-slate-100">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t-sm"
            style={{ height: `${25 + ((i * 17) % 65)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-2.5 w-8 bg-slate-100 rounded-xs" />
        ))}
      </div>
    </div>
  );
};
