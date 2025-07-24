'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({ onSelectDate }) {
  const [date, setDate] = useState(null);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    onSelectDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          className={cn(
            "w-9 h-9",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white text-black">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}