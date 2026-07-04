import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDatePicker({ value, onChange, placeholder = "Select date", className = "" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Correctly parse the local date string to avoid timezone offset shifts
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format back to YYYY-MM-DD accurately using local time
      const dateString = format(date, 'yyyy-MM-dd');
      onChange(dateString);
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 top-[120%] left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-0 bg-white dark:bg-zinc-900 border border-border rounded-[1.5rem] p-3 shadow-2xl"
          >
            <style>
              {`
                .rdp {
                  --rdp-cell-size: 40px;
                  --rdp-accent-color: var(--tw-prose-body, #000);
                  --rdp-background-color: rgba(0,0,0,0.05);
                  margin: 0;
                }
                .dark .rdp {
                  --rdp-accent-color: #fff;
                  --rdp-background-color: rgba(255,255,255,0.1);
                }
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                  background-color: hsl(var(--primary));
                  color: hsl(var(--primary-foreground));
                  font-weight: bold;
                }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                  background-color: var(--rdp-background-color);
                }
                .rdp-day_today {
                  font-weight: 900;
                  color: hsl(var(--primary));
                }
                .rdp-caption_label {
                  font-size: 14px;
                  font-weight: bold;
                }
                .rdp-head_cell {
                  font-size: 10px;
                  text-transform: uppercase;
                  font-weight: 800;
                  color: hsl(var(--muted-foreground));
                }
                .rdp-day {
                  border-radius: 0.5rem;
                  font-size: 14px;
                  font-weight: 600;
                }
              `}
            </style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              showOutsideDays
              components={{
                IconLeft: () => <ChevronLeft className="w-4 h-4" />,
                IconRight: () => <ChevronRight className="w-4 h-4" />
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
