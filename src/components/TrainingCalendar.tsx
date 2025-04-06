import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface TrainingEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: 'pending' | 'approved' | 'rejected';
    trainer?: string;
    description: string;
  };
}

interface Training {
  id: string;
  topic: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  trainer?: string;
  description: string;
}

import { EventClickArg, DateSelectArg } from '@fullcalendar/core';

interface TrainingCalendarProps {
  trainings: Training[];
  onEventClick?: (event: EventClickArg) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
}

export default function TrainingCalendar({ trainings, onEventClick, onDateSelect }: TrainingCalendarProps) {
  const [events, setEvents] = useState<TrainingEvent[]>([]);

  useEffect(() => {
    // Convertir las capacitaciones a eventos del calendario
    const calendarEvents = trainings.map(training => {
      // Asegurarse de que la hora tenga el formato correcto (HH:mm)
      const time = training.time.padStart(5, '0');
      // Crear fecha combinando fecha y hora
      const startDate = new Date(`${training.date}T${time}:00`);
      const endDate = new Date(startDate.getTime() + (90 * 60000)); // 90 minutos de duración

      // Validar que la fecha sea válida
      if (isNaN(startDate.getTime())) {
        console.error('Fecha inválida:', training.date, time);
        return null;
      }

      let backgroundColor = '#FEF3C7'; // Amarillo claro para pendiente
      let borderColor = '#D97706'; // Amarillo oscuro
      let textColor = '#92400E'; // Texto amarillo oscuro

      if (training.status === 'approved') {
        backgroundColor = '#DEF7EC'; // Verde claro
        borderColor = '#059669'; // Verde oscuro
        textColor = '#065F46'; // Texto verde oscuro
      } else if (training.status === 'rejected') {
        backgroundColor = '#FEE2E2'; // Rojo claro
        borderColor = '#DC2626'; // Rojo oscuro
        textColor = '#991B1B'; // Texto rojo oscuro
      }

      return {
        id: training.id,
        title: training.topic,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: {
          status: training.status,
          trainer: training.trainer,
          description: training.description
        }
      };
    }).filter(event => event !== null) as TrainingEvent[]; // Filtrar eventos nulos

    setEvents(calendarEvents);
  }, [trainings]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        events={events}
        eventClick={onEventClick}
        selectable={true}
        select={onDateSelect}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={false}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '18:00'
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        height="auto"
      />
    </div>
  );
}
