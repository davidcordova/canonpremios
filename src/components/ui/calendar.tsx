import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { DayPicker, DateRange } from 'react-day-picker';

interface CalendarProps {
  className?: string;
  classNames?: {
    [key: string]: string;
  };
  showOutsideDays?: boolean;
  mode?: "range";
  defaultMonth?: Date | undefined;
  selected?: DateRange | undefined;
  onSelect?: (date: DateRange | undefined) => void;
  numberOfMonths?: number | undefined;
  pagedNavigation?: boolean | undefined;
}

function Calendar({ className, classNames, showOutsideDays = true, mode = "range", defaultMonth, selected, onSelect, numberOfMonths, pagedNavigation, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        ...classNames,
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 opacity-50 data-[disabled]:opacity-0' // Increased size h-7 w-7 -> h-8 w-8
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        // Set explicit width (1/7th) and ensure text centering
        head_cell: 'text-muted-foreground rounded-md w-[14.28%] flex justify-center font-normal text-[0.8rem] p-1', 
        row: 'flex w-full mt-2',
        // Removed [&:has([data-selected])]:bg-accent to clarify selection styles
        cell: 'text-center text-sm p-0 relative first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md focus-within:relative focus-within:z-20', 
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          // Removed fixed width w-9, let flexbox handle size within cell
          'h-9 p-0 font-normal aria-selected:opacity-100 flex-1 justify-center' 
        ),
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      mode={mode}
      defaultMonth={defaultMonth}
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={numberOfMonths}
      pagedNavigation={pagedNavigation}
      {...props}
    />
  );
}

export { Calendar };
