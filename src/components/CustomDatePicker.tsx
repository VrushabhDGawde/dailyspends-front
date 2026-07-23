import { useState, useRef, useEffect } from 'react';
import { format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  maxDate?: Date;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CustomDatePicker({ value, onChange, placeholder = "Select date", className = "", maxDate }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;
  const [currentViewDate, setCurrentViewDate] = useState(selectedDate || new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date) => {
    if (maxDate && isAfter(startOfDay(date), startOfDay(maxDate))) return;
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };
  
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const days = [];
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDaysCount - i, isOutside: true, date: new Date(year, month - 1, prevMonthDaysCount - i) });
  }
  for (let i = 1; i <= daysInMonthCount; i++) {
    days.push({ day: i, isOutside: false, date: new Date(year, month, i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isOutside: true, date: new Date(year, month + 1, i) });
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-transparent text-sm font-bold focus:outline-none text-foreground hover:opacity-80 transition-opacity whitespace-nowrap"
      >
        {selectedDate ? format(selectedDate, "MMM dd, yyyy") : <span className="text-muted-foreground/70">{placeholder}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 top-[120%] left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/30 dark:border-white/15 rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[280px]"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <button type="button" onClick={handlePrevMonth} className="h-7 w-7 bg-transparent opacity-50 hover:opacity-100 flex items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold">
                {format(currentViewDate, 'MMMM yyyy')}
              </div>
              <button type="button" onClick={handleNextMonth} className="h-7 w-7 bg-transparent opacity-50 hover:opacity-100 flex items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-muted-foreground font-bold text-[0.7rem] uppercase text-center w-8">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((item, idx) => {
                const isSelected = selectedDate && isSameDay(item.date, selectedDate);
                const isToday = isSameDay(item.date, new Date());
                const isDisabled = maxDate && isAfter(startOfDay(item.date), startOfDay(maxDate));
                
                let btnClass = "h-8 w-8 mx-auto p-0 font-bold rounded-md flex items-center justify-center transition-all text-sm ";
                
                if (isDisabled) {
                  btnClass += "opacity-25 pointer-events-none ";
                } else if (item.isOutside) {
                  btnClass += "text-muted-foreground opacity-40 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ";
                } else {
                  btnClass += "hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ";
                }
                
                if (isSelected) {
                  btnClass += "bg-primary text-primary-foreground shadow-md hover:bg-primary ";
                } else if (isToday && !item.isOutside) {
                  btnClass += "text-primary font-extrabold ";
                }
                
                return (
                  <button
                    type="button"
                    key={idx}
                    disabled={isDisabled}
                    onClick={(e) => { e.stopPropagation(); handleSelect(item.date); }}
                    className={btnClass}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
