import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    startOfWeek,
    endOfWeek,
} from 'date-fns';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';

export default function MyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        setIsEventDialogOpen(true);
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {format(currentDate, dateFormat)}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 ml-2">
                                Today
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tasks</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Milestones</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Reminders</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Priority</span>
                        </div>

                        <Button onClick={() => handleDateClick(new Date())} className="bg-blue-600 hover:bg-blue-700 h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Entry
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] border border-gray-200 rounded-lg overflow-hidden">
                    {/* Days of week */}
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 border-b border-gray-200 border-r last:border-r-0 bg-gray-50/50">
                            {day}
                        </div>
                    ))}

                    {/* Days grid */}
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDateClick(day)}
                                className={`
                  min-h-[120px] p-2 border-b border-r last:border-r-0 border-gray-200 relative cursor-pointer
                  transition-colors hover:bg-gray-50
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'text-gray-900'}
                  ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
                            >
                                <div className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-sm
                  ${isCurrentDay ? 'bg-blue-600 text-white font-medium' : ''}
                `}>
                                    {format(day, 'd')}
                                </div>

                                {/* We will render events here later */}
                                <div className="mt-2 space-y-1">
                                    {/* Dummy event to show UI */}
                                    {isCurrentDay && (
                                        <div className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200 truncate font-medium">
                                            📱 Project Sync
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CalendarEventDialog
                open={isEventDialogOpen}
                onOpenChange={setIsEventDialogOpen}
                selectedDate={selectedDate}
            />
        </MainLayout>
    );
}
