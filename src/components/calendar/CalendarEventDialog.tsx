import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { TaskForm } from './TaskForm';
import { ReminderForm } from './ReminderForm';
import { MilestoneForm } from './MilestoneForm';
import { CheckSquare, Bell, Flag, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

interface CalendarEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date | null;
}

type ViewState = 'menu' | 'task' | 'reminder' | 'milestone';

export function CalendarEventDialog({
    open,
    onOpenChange,
    selectedDate,
}: CalendarEventDialogProps) {
    const [view, setView] = useState<ViewState>('menu');

    // Reset view when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => setView('menu'), 200); // delay so it doesn't flicker while closing
        } else {
            setView('menu');
        }
    }, [open]);

    if (!selectedDate) return null;

    const handleClose = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${view === 'menu' ? 'sm:max-w-[400px]' : 'sm:max-w-[600px]'} p-0 overflow-hidden bg-white transition-all duration-200`}>

                <DialogDescription className="sr-only">
                    Create a new calendar event
                </DialogDescription>
                {view === 'menu' && (
                    <>
                        <DialogTitle className="sr-only">Select Event Type</DialogTitle>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900">
                                    {format(selectedDate, 'EEE, MMM d')}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <button
                                onClick={() => setView('task')}
                                className="flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left"
                            >
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-500 mt-1">
                                    <CheckSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Create Task</h4>
                                    <p className="text-sm text-gray-500">Set a deadline and assign owners</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setView('reminder')}
                                className="flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left"
                            >
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-500 mt-1">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Add Reminder</h4>
                                    <p className="text-sm text-gray-500">Get notified about important dates</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setView('milestone')}
                                className="flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-left"
                            >
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-500 mt-1">
                                    <Flag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Add Milestone</h4>
                                    <p className="text-sm text-gray-500">Mark significant project progress</p>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-400 font-medium tracking-wide">PRESS ESC TO CANCEL</p>
                        </div>
                    </>
                )}

                {view !== 'menu' && (
                    <div className="flex flex-col h-full max-h-[85vh]">
                        <div className="p-5 pb-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => setView('menu')}
                                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <DialogTitle className="text-xl font-semibold">
                                {view === 'task' && "Create New Task"}
                                {view === 'reminder' && "New Reminder"}
                                {view === 'milestone' && "Add Project Milestone"}
                            </DialogTitle>
                        </div>

                        <div className="overflow-y-auto px-6 pb-6 custom-scrollbar flex-1">
                            {view === 'task' && <TaskForm selectedDate={selectedDate} onClose={handleClose} />}
                            {view === 'reminder' && <ReminderForm selectedDate={selectedDate} onClose={handleClose} />}
                            {view === 'milestone' && <MilestoneForm selectedDate={selectedDate} onClose={handleClose} />}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
