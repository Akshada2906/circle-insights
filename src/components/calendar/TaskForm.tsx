import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Bold, Italic, List, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableAccountSelect } from './SearchableAccountSelect';

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
}

export function TaskForm({ selectedDate, onClose }: Props) {
    const [startDate, setStartDate] = useState<Date | undefined>(selectedDate || new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState("09:00");
    const [dueTime, setDueTime] = useState("17:00");
    const [account, setAccount] = useState("");

    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [duePopoverOpen, setDuePopoverOpen] = useState(false);

    const [estimatedValue, setEstimatedValue] = useState("0");
    const [estimatedUnit, setEstimatedUnit] = useState("Hours");

    useEffect(() => {
        if (startDate && dueDate) {
            const start = new Date(startDate);
            const [startH, startM] = startTime.split(':').map(Number);
            start.setHours(startH || 0, startM || 0, 0, 0);

            const end = new Date(dueDate);
            const [endH, endM] = dueTime.split(':').map(Number);
            end.setHours(endH || 0, endM || 0, 0, 0);

            const diffMs = end.getTime() - start.getTime();
            if (diffMs > 0) {
                const diffHours = diffMs / (1000 * 60 * 60);
                if (diffHours >= 24) {
                    setEstimatedValue((diffHours / 24).toFixed(1).replace(/\.0$/, ''));
                    setEstimatedUnit("Days");
                } else {
                    setEstimatedValue(diffHours.toFixed(1).replace(/\.0$/, ''));
                    setEstimatedUnit("Hours");
                }
            } else {
                setEstimatedValue("0");
            }
        }
    }, [startDate, startTime, dueDate, dueTime]);

    return (
        <div className="space-y-6 pt-2 h-full">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Left Column */}
                <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">Task Title</Label>
                        <Input id="title" placeholder="Enter a concise title for the task" className="shadow-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                            <div className="bg-gray-50 flex items-center gap-1 p-1 border-b border-gray-200">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Bold className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Italic className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><List className="h-4 w-4" /></Button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-200"><Link className="h-4 w-4" /></Button>
                            </div>
                            <Textarea placeholder="Describe the scope of this task..." className="border-0 shadow-none focus-visible:ring-0 resize-none min-h-[100px]" />
                        </div>
                    </div>


                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-4">


                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Add Account</Label>
                        <SearchableAccountSelect value={account} onSelect={setAccount} placeholder="Search accounts..." />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Priority</Label>
                            <Select defaultValue="high">
                                <SelectTrigger className="shadow-sm">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div> High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="low">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Low
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                            <Select defaultValue="todo">
                                <SelectTrigger className="shadow-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                        <div className="flex gap-2">
                            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal shadow-sm flex-1",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "MMM d, yyyy") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(d) => { if (d) setStartDate(d); setDatePopoverOpen(false); }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-[120px] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                        <div className="flex gap-2">
                            <Popover open={duePopoverOpen} onOpenChange={setDuePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal shadow-sm flex-1",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "MMM d, yyyy") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(d) => { if (d) setDueDate(d); setDuePopoverOpen(false); }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="w-[120px] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Estimated Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="number"
                                value={estimatedValue}
                                onChange={(e) => setEstimatedValue(e.target.value)}
                                min="0"
                                className="pl-9 pr-[84px] shadow-sm"
                            />
                            <div className="absolute right-1 top-1 text-gray-500">
                                <Select value={estimatedUnit} onValueChange={setEstimatedUnit}>
                                    <SelectTrigger className="h-8 border-0 shadow-none bg-transparent focus:ring-0 w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hours">Hours</SelectItem>
                                        <SelectItem value="Days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>



                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                <div className="text-xs text-gray-400">© 2024 Project Planner. All rights reserved.</div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="px-5 font-medium shadow-sm">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 font-medium shadow-sm">Create Task</Button>
                </div>
            </div>
        </div>
    );
}
