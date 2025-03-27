import React, { useState } from 'react';
import { format } from 'date-fns';
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

export function DateRangePicker({ onDateChange, value }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);

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
            {date?.from ? (
              date.to ? (
                `${format(date.from, 'LLL dd, y')} - ${format(
                  date.to,
                  'LLL dd, y'
                )}`
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            defaultMonth={date?.from ? date.from : new Date()}
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
