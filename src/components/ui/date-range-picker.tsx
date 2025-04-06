import React, { useState, useEffect } from 'react'; // Import useEffect if needed for value prop changes
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DateRangePickerProps {
  onDateChange: (date: DateRange | undefined) => void;
  value?: DateRange;
}

// Helper function to check for valid Date objects
const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

export function DateRangePicker({ onDateChange, value }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);

  // Optional: Sync state if the external value prop changes
  useEffect(() => {
    setDate(value);
  }, [value]);

  return (
    <div className="flex flex-col space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {/* Check if dates are valid before formatting */}
            {isValidDate(date?.from) ? (
              isValidDate(date?.to) ? (
                `${format(date.from, 'LLL dd, y', { locale: es })} - ${format(
                  date.to,
                  'LLL dd, y',
                  { locale: es }
                )}`
              ) : (
                // Only 'from' date is selected and valid
                format(date.from, 'LLL dd, y', { locale: es })
              )
            ) : (
              // No valid 'from' date, show placeholder
              <span>Selecciona un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            // Use valid date for defaultMonth or fallback to current date
            defaultMonth={isValidDate(date?.from) ? date.from : new Date()}
            selected={date}
            onSelect={(range) => {
              setDate(range);
              onDateChange(range);
            }}
            numberOfMonths={2}
            pagedNavigation
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
