import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Edit2,
    Trash2,
    X,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import { CalendarEventResponse } from '@/types/calendar-api';
import React, { useEffect } from 'react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

export default function MyCalendar() {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

    const [events, setEvents] = useState<CalendarEventResponse[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [editEventData, setEditEventData] = useState<CalendarEventResponse | null>(null);

    const [eventToDelete, setEventToDelete] = useState<CalendarEventResponse | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setIsFetching(true);
            const data = await api.getCalendarEvents();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Refresh when dialog closes
    useEffect(() => {
        if (!isEventDialogOpen) {
            fetchEvents();
        }
    }, [isEventDialogOpen]);

    const eventsByDate = React.useMemo(() => {
        const map = new Map<string, CalendarEventResponse[]>();
        events.forEach(event => {
            let dateStr: string | null = null;
            if (event.event_type === 'TASK' && event.details?.start_date) {
                dateStr = format(new Date(event.details.start_date), 'yyyy-MM-dd');
            } else if (event.event_type === 'MILESTONE' && event.details?.target_date) {
                dateStr = format(new Date(event.details.target_date), 'yyyy-MM-dd');
            } else if (event.event_type === 'REMINDER' && event.details?.reminder_date) {
                dateStr = format(new Date(event.details.reminder_date), 'yyyy-MM-dd');
            }

            if (dateStr) {
                const current = map.get(dateStr) || [];
                map.set(dateStr, [...current, event]);
            }
        });
        return map;
    }, [events]);

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
        setEditEventData(null);
        setSelectedDate(day);
        setIsEventDialogOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: CalendarEventResponse) => {
        e.stopPropagation();
        setEditEventData(event);

        // Find the correct date based on event type to pass to the dialog
        let d = new Date();
        if (event.event_type === 'TASK' && event.details?.start_date) {
            d = new Date(event.details.start_date);
        } else if (event.event_type === 'MILESTONE' && event.details?.target_date) {
            d = new Date(event.details.target_date);
        } else if (event.event_type === 'REMINDER' && event.details?.reminder_date) {
            d = new Date(event.details.reminder_date);
        }

        setSelectedDate(d);
        setIsEventDialogOpen(true);
    };

    const handleDeleteDirect = (e: React.MouseEvent, event: CalendarEventResponse) => {
        e.stopPropagation();
        if (!event.details?.id) return;
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteDirect = async () => {
        if (!eventToDelete || !eventToDelete.details?.id) return;

        setIsDeleting(true);
        try {
            if (eventToDelete.event_type === 'TASK') {
                await api.deleteCalendarTask(eventToDelete.details.id);
            } else if (eventToDelete.event_type === 'MILESTONE') {
                await api.deleteCalendarMilestone(eventToDelete.details.id);
            } else if (eventToDelete.event_type === 'REMINDER') {
                await api.deleteCalendarReminder(eventToDelete.details.id);
            }
            toast({ title: "Success", description: "Event deleted successfully." });
            fetchEvents();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
        }
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
                  min-h-[140px] p-2 border-b border-r last:border-r-0 border-gray-200 relative cursor-pointer
                  transition-colors hover:bg-gray-50
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 opacity-70' : 'text-gray-900'}
                  ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
                            >
                                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm mb-1
                  ${isCurrentDay ? 'bg-blue-600 text-white font-medium shadow-sm' : ''}
                `}>
                                    {format(day, 'd')}
                                </div>

                                <div className="mt-1 space-y-1.5 w-full relative z-10">
                                    {(eventsByDate.get(format(day, 'yyyy-MM-dd')) || []).map(event => {
                                        let bgClass = "bg-gray-50 text-gray-700 border-gray-200 shadow-sm";
                                        let icon = "🗓️";
                                        let title = "Event";
                                        let borderClass = "";

                                        if (event.event_type === 'TASK') {
                                            bgClass = "bg-blue-50 text-blue-700 border-blue-200 shadow-[0_1px_2px_rgba(59,130,246,0.1)] hover:bg-blue-100/80";
                                            icon = "✅";
                                            title = event.details?.task_title || "Untitled Task";
                                            if (event.details?.priority === "HIGH") borderClass = "border-l-4 border-l-red-500";
                                        } else if (event.event_type === 'MILESTONE') {
                                            bgClass = "bg-purple-50 text-purple-700 border-purple-200 shadow-[0_1px_2px_rgba(168,85,247,0.1)] hover:bg-purple-100/80";
                                            icon = "🚩";
                                            title = event.details?.milestone_name || "Untitled Milestone";
                                        } else if (event.event_type === 'REMINDER') {
                                            bgClass = "bg-green-50 text-green-700 border-green-200 shadow-[0_1px_2px_rgba(34,197,94,0.1)] hover:bg-green-100/80";
                                            icon = "⏰";
                                            title = event.details?.reminder_title || "Untitled Reminder";
                                        }

                                        return (
                                            <Popover
                                                key={event.id}
                                                open={openPopoverId === event.id}
                                                onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? event.id : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenPopoverId(openPopoverId === event.id ? null : event.id);
                                                        }}
                                                        className={`px-2 py-1.5 text-[11px] rounded-md border font-medium cursor-pointer flex items-center gap-1.5 transition-all w-full truncate ${bgClass} ${borderClass}`}
                                                    >
                                                        <span>{icon}</span> <span className="truncate">{title}</span>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0 shadow-xl border-gray-100 rounded-xl overflow-hidden" align="start" onClick={(e) => e.stopPropagation()}>
                                                    <div className={`p-4 border-b ${event.event_type === 'TASK' ? 'bg-blue-50/50 border-blue-100' :
                                                        event.event_type === 'MILESTONE' ? 'bg-purple-50/50 border-purple-100' :
                                                            'bg-green-50/50 border-green-100'
                                                        }`}>
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-semibold text-base text-gray-900 flex items-center gap-2 break-all pr-6"><span>{icon}</span> {title}</h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenPopoverId(null);
                                                                }}
                                                                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                <span className="sr-only">Close</span>
                                                            </button>
                                                        </div>
                                                        {event.event_type === 'TASK' && event.details?.priority && (
                                                            <div className="mt-3 flex gap-2">
                                                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${event.details.priority === 'HIGH' ? 'bg-red-100 text-red-700' : event.details.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{event.details.priority}</span>
                                                                {event.details?.status && <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{event.details?.status?.replace('_', ' ')}</span>}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4 space-y-4">
                                                        {(event.details?.description || event.details?.notes) && (
                                                            <div className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100 break-words break-all whitespace-pre-wrap max-h-[150px] overflow-y-auto custom-scrollbar">
                                                                {event.details?.description || event.details?.notes}
                                                            </div>
                                                        )}

                                                        {event.event_type === 'TASK' && (
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                {event.details?.start_date && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Start</span>
                                                                        <span className="text-gray-900 font-medium">{format(new Date(event.details.start_date), 'MMM d, yy h:mm a')}</span>
                                                                    </div>
                                                                )}
                                                                {event.details?.due_date && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Due</span>
                                                                        <span className="text-gray-900 font-medium">{format(new Date(event.details.due_date), 'MMM d, yy h:mm a')}</span>
                                                                    </div>
                                                                )}
                                                                {(event.details?.estimated_hours > 0 || event.details?.estimated_hours === 0) && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Duration</span>
                                                                        <span className="text-gray-900 font-medium">{event.details.estimated_hours} Hours</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {event.event_type === 'MILESTONE' && (
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                {event.details?.target_date && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Target Date</span>
                                                                        <span className="text-gray-900 font-medium">{format(new Date(event.details.target_date), 'MMM d, yyyy')}</span>
                                                                    </div>
                                                                )}
                                                                {event.details?.impact_level && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Impact</span>
                                                                        <span className="text-gray-900 font-medium">{event.details.impact_level}</span>
                                                                    </div>
                                                                )}
                                                                {event.details?.progress_percent !== undefined && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Progress</span>
                                                                        <span className="text-gray-900 font-medium">{event.details.progress_percent}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {event.event_type === 'REMINDER' && (
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                {event.details?.reminder_date && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Date</span>
                                                                        <span className="text-gray-900 font-medium">{format(new Date(event.details.reminder_date), 'MMM d, yyyy')}</span>
                                                                    </div>
                                                                )}
                                                                {event.details?.reminder_time && (
                                                                    <div>
                                                                        <span className="block text-gray-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Time</span>
                                                                        <span className="text-gray-900 font-medium">{event.details.reminder_time}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 text-xs h-9 bg-white shadow-sm"
                                                            onClick={(e) => {
                                                                handleEventClick(e, event);
                                                                // The popover will close when they interact within the newly opened dialog or click away
                                                            }}
                                                        >
                                                            <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="flex-1 text-xs h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => handleDeleteDirect(e, event)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        );
                                    })}
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
                editEventData={editEventData}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Event"
                description={`Are you sure you want to delete this ${eventToDelete?.event_type?.toLowerCase() || 'event'}? This action cannot be undone.`}
                onConfirm={confirmDeleteDirect}
                variant="destructive"
                confirmText="Delete Event"
                isLoading={isDeleting}
            />
        </MainLayout>
    );
}
