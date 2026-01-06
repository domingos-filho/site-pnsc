import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadEvents } from '@/lib/supabaseData';
import { isSupabaseReady } from '@/lib/supabaseClient';

const fallbackEvents = [
  {
    id: 1,
    title: 'Missa Dominical',
    date: '2025-10-26',
    time: '08:00',
    location: 'Igreja Matriz',
    description: 'Celebração Eucarística Dominical',
  },
  {
    id: 2,
    title: 'Catequese Infantil',
    date: '2025-10-25',
    time: '14:00',
    location: 'Salão Paroquial',
    description: 'Encontro de formação para crianças',
  },
  {
    id: 3,
    title: 'Grupo de Oração',
    date: '2025-10-29',
    time: '20:00',
    location: 'Capela',
    description: 'Renovação Carismática Católica',
  },
  {
    id: 4,
    title: 'Adoração ao Santíssimo',
    date: '2025-11-07',
    time: '19:00',
    location: 'Igreja Matriz',
    description: 'Primeira sexta-feira do mês',
  },
  {
    id: 5,
    title: 'Encontro de Casais',
    date: '2025-11-01',
    time: '19:00',
    location: 'Salão Paroquial',
    description: 'ECC - Encontro de Casais com Cristo',
  },
];

const Events = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      const { events: loaded } = await loadEvents();
      const eventsToShow =
        !isSupabaseReady && loaded.length === 0 ? fallbackEvents : loaded;

      if (isMounted) {
        setEvents(eventsToShow);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingEvents = events
    .filter((event) => new Date(`${event.date}T00:00:00`) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const formatDateString = (day) => {
    if (!day) return null;
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(
      2,
      '0'
    )}`;
  };

  const getEventsForDay = (day) => {
    const dateStr = formatDateString(day);
    if (!dateStr) return [];
    return events.filter((event) => event.date === dateStr);
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(
    2,
    '0'
  )}`;
  const todayEvents = events
    .filter((event) => event.date === todayKey)
    .slice()
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i += 1) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push(i);
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <>
      <Helmet>
        <title>Agenda de Eventos - Paróquia de Nossa Senhora da Conceição</title>
        <meta
          name="description"
          content="Confira a agenda de eventos, missas e atividades da Paróquia de Nossa Senhora da Conceição."
        />
      </Helmet>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Agenda de Eventos</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Fique por dentro de todas as atividades da nossa paróquia
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-600 text-sm py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="aspect-square" />;
                    }

                    const dateStr = formatDateString(day);
                    const dayEvents = getEventsForDay(day);
                    const isEventDay = dayEvents.length > 0;
                    const dayDate = new Date(`${dateStr}T00:00:00`);
                    const isPastEventDay = isEventDay && dayDate < todayStart;

                    return (
                      <div
                        key={index}
                        className={`relative group aspect-square flex items-center justify-center rounded-lg text-sm ${
                          isEventDay
                            ? 'bg-blue-100 text-blue-700 font-bold cursor-pointer hover:bg-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                        {isPastEventDay && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900/95 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                            <div className="font-semibold mb-1">
                              {dayDate.toLocaleDateString('pt-BR')}
                            </div>
                            <ul className="space-y-1">
                              {dayEvents.map((event) => (
                                <li key={event.id} className="leading-snug">
                                  <span className="font-medium">{event.title}</span>
                                  {event.time ? ` - ${event.time}` : ''}
                                  {event.location ? ` - ${event.location}` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Eventos de Hoje
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {today.toLocaleDateString('pt-BR')}
                  </p>
                  <div className="space-y-4">
                    {todayEvents.length > 0 ? (
                      todayEvents.map((event) => (
                        <div key={event.id} className="border-l-4 border-blue-600 pl-4 py-2">
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          {event.time && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum evento para hoje.</p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Próximos Eventos
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="border-l-4 border-blue-600 pl-4 py-2">
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(`${event.date}T00:00:00`).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {event.time && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum evento futuro agendado.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Events;
