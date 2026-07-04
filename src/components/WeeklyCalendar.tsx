import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  expenseDates: Set<string>; // ISO date strings
}

export function WeeklyCalendar({ selectedDate, onSelectDate, expenseDates }: Props) {
  // Generate the last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className="glass rounded-3xl p-4 md:p-6 mb-6">
      <div className="flex justify-between items-center w-full">
        {days.map((date, i) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const dateString = date.toISOString().split('T')[0];
          const hasExpense = expenseDates.has(dateString);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className="relative flex flex-col items-center justify-center w-12 h-16 md:w-14 md:h-18 rounded-2xl transition-colors"
            >
              {isSelected && (
                <motion.div
                  layoutId="calendar-pill"
                  className="absolute inset-0 bg-foreground rounded-2xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              
              <span className={`text-xs font-medium z-10 ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-lg font-bold z-10 mt-1 ${isSelected ? 'text-background' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
              
              {/* Dot Indicator for expenses */}
              <div className="h-1.5 w-1.5 mt-1 z-10 flex justify-center">
                {hasExpense && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-background' : 'bg-primary/40'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
