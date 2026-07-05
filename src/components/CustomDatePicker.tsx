import { format } from 'date-fns';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  maxDate?: Date;
}

export function CustomDatePicker({ value, onChange, placeholder = "Select date", className = "", maxDate }: CustomDatePickerProps) {
  // The value is YYYY-MM-DD
  const maxDateStr = maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined;

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="date"
          value={value}
          max={maxDateStr}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-foreground focus:outline-none focus:ring-0 cursor-pointer appearance-none date-input-no-icon"
          style={{ minWidth: '110px' }}
        />
      </div>
      <style>{`
        .date-input-no-icon::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>
    </div>
  );
}
