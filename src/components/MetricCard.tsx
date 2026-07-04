import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  delay?: number;
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp, className, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }}
      className={cn(
        "glass p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/5 rounded-xl">
          <Icon className="w-6 h-6 text-primary/80" />
        </div>
        {trend && (
          <span className={cn("text-sm font-medium", trendUp ? "text-green-500" : "text-red-500")}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
