import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  expenseDates: Set<string>; // ISO date strings
}

export function FullCalendar({ selectedDate, onSelectDate, expenseDates }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();

  // Generate calendar grid array (padding with nulls for empty cells)
  const calendarGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarGrid.push(i);
  }

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="glass rounded-3xl p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {weekdays.map(day => (
          <div key={day} className="text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-2"
        >
          {calendarGrid.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-12" />;
            }

            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateString = dateObj.toISOString().split('T')[0];
            const isToday = dateObj.toDateString() === today.toDateString();
            const isSelected = dateObj.toDateString() === selectedDate.toDateString();
            const hasData = expenseDates.has(dateString);

            // Determine styles based on states
            let baseStyles = "relative h-12 w-full rounded-2xl flex items-center justify-center font-medium transition-all text-sm ";
            
            if (isSelected) {
              baseStyles += "bg-foreground text-background shadow-md scale-105 z-10 ";
            } else if (hasData) {
              baseStyles += "bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:hover:bg-primary/40 ";
            } else {
              baseStyles += "text-foreground hover:bg-black/5 dark:hover:bg-white/5 ";
            }

            if (isToday && !isSelected) {
              baseStyles += "border-2 border-primary ";
            }

            return (
              <button
                key={day}
                onClick={() => onSelectDate(dateObj)}
                className={baseStyles}
              >
                {day}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
