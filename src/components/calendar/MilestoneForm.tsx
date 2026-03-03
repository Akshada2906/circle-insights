import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';

interface Props {
    selectedDate: Date | null;
    onClose: () => void;
}

export function MilestoneForm({ selectedDate, onClose }: Props) {
    const [targetDate, setTargetDate] = useState<Date | undefined>(selectedDate || new Date());
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [progress, setProgress] = useState([0]);

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4 max-w-xl mx-auto">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Milestone Name</Label>
                    <div className="relative">
                        <Trophy className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input id="name" placeholder="e.g., Beta Release, Security Audit Complete" className="pl-9 shadow-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Project</Label>
                        <Select defaultValue="marketing">
                            <SelectTrigger className="shadow-sm">
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ecommerce">E-Commerce Redesign</SelectItem>
                                <SelectItem value="marketing">Marketing Q4 Campaign</SelectItem>
                                <SelectItem value="internal">Internal Tools</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Target Date</Label>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal shadow-sm",
                                        !targetDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {targetDate ? format(targetDate, "yyyy-MM-dd") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={targetDate}
                                    onSelect={(d) => { setTargetDate(d); setDatePopoverOpen(false); }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                        placeholder="Outline the success criteria and deliverables for this milestone..."
                        className="resize-none min-h-[100px] shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Owner</Label>
                        <Select defaultValue="alex">
                            <SelectTrigger className="shadow-sm">
                                <SelectValue placeholder="Select owner">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                                            <AvatarFallback>AR</AvatarFallback>
                                        </Avatar>
                                        Alex Rivera
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alex">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                                            <AvatarFallback>AR</AvatarFallback>
                                        </Avatar>
                                        Alex Rivera
                                    </div>
                                </SelectItem>
                                <SelectItem value="sarah">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                                            <AvatarFallback>SJ</AvatarFallback>
                                        </Avatar>
                                        Sarah Jenkins
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Impact Level</Label>
                        <Select defaultValue="high">
                            <SelectTrigger className="shadow-sm">
                                <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High Impact</SelectItem>
                                <SelectItem value="medium">Medium Impact</SelectItem>
                                <SelectItem value="low">Low Impact</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-blue-500" /> Progress Status
                        </Label>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{progress[0]}%</span>
                    </div>

                    <Slider
                        value={progress}
                        onValueChange={setProgress}
                        max={100}
                        step={1}
                        className="py-2"
                    />

                    <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        <span>Not Started</span>
                        <span>In Progress</span>
                        <span>Final Review</span>
                        <span>Completed</span>
                    </div>
                </div>

            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6 max-w-xl mx-auto">
                <div className="text-xs text-gray-400">© 2024 Project Planner. All rights reserved.</div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="px-5 font-medium shadow-sm">Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 font-medium shadow-sm">Create Milestone</Button>
                </div>
            </div>
        </div>
    );
}
