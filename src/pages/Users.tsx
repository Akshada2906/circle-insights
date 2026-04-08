
import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAccounts } from '@/contexts/AccountContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserPlus, Filter, X, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/user';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nitorinfotech.com',
    role: 'Admin',
    assignedAccounts: ['Global Tech Solutions', 'Nexus Banking'],
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@nitorinfotech.com',
    role: 'User',
    assignedAccounts: ['Cloud Dynamics'],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@nitorinfotech.com',
    role: 'User',
    assignedAccounts: ['Silverline Corp', 'Nexus Banking'],
  },
  {
    id: '4',
    name: 'David Park',
    email: 'd.park@nitorinfotech.com',
    role: 'Admin',
    assignedAccounts: ['Global Tech Solutions'],
  },
  {
    id: '5',
    name: 'Amara Okafor',
    email: 'amara.o@nitorinfotech.com',
    role: 'User',
    assignedAccounts: ['Quantum Systems'],
  },
];

const Users = () => {
  const { accounts } = useAccounts();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'User',
    password: '',
    assignedAccounts: [],
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openAddUser = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser({ name: '', email: '', role: 'User', password: '', assignedAccounts: [] });
    setIsAddUserOpen(true);
  };

  const openEditUser = (user: User) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setNewUser({ ...user, password: '' }); 
    setIsAddUserOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({
      title: 'User Deleted',
      description: `${name} has been removed.`,
    });
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email || (!isEditMode && !newUser.password)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (isEditMode && editingUserId) {
      setUsers(users.map(u => u.id === editingUserId ? { ...u, ...(newUser as User) } : u));
      toast({
        title: 'User Updated',
        description: `${newUser.name} has been successfully updated.`,
      });
    } else {
      const userToAdd: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name as string,
        email: newUser.email as string,
        role: newUser.role as 'Admin' | 'User',
        password: newUser.password as string,
        assignedAccounts: newUser.assignedAccounts || [],
      };
      setUsers([...users, userToAdd]);
      toast({
        title: 'User Added',
        description: `${userToAdd.name} has been successfully added.`,
      });
    }

    setNewUser({
      name: '',
      email: '',
      role: 'User',
      password: '',
      assignedAccounts: [],
    });
    setIsAddUserOpen(false);
  };

  const toggleAccountSelection = (accountName: string) => {
    const currentAccounts = newUser.assignedAccounts || [];
    if (currentAccounts.includes(accountName)) {
      setNewUser({
        ...newUser,
        assignedAccounts: currentAccounts.filter(name => name !== accountName)
      });
    } else {
      setNewUser({
        ...newUser,
        assignedAccounts: [...currentAccounts, accountName]
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users</h1>
              <p className="text-slate-500 mt-1">Manage platform users and their assigned accounts.</p>
            </div>

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddUser} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter user's full name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: 'Admin' | 'User') => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password {isEditMode && <span className="text-xs font-normal text-slate-500">(Leave blank to keep current)</span>}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password || ''}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold mb-1">Assigned Accounts</Label>
                    <Select
                      onValueChange={(value) => toggleAccountSelection(value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select accounts..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem 
                            key={account.account_id} 
                            value={account.account_name}
                            className={newUser.assignedAccounts?.includes(account.account_name) ? "bg-blue-50 font-bold" : ""}
                          >
                            <div className="flex items-center gap-2">
                              {newUser.assignedAccounts?.includes(account.account_name) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              )}
                              {account.account_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newUser.assignedAccounts && newUser.assignedAccounts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-h-[100px] overflow-y-auto p-1">
                        {newUser.assignedAccounts.map((accountName, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-blue-600/10 text-blue-700 border-blue-200/50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer group flex items-center gap-1 py-1"
                            onClick={() => toggleAccountSelection(accountName)}
                          >
                            {accountName}
                            <X className="w-3 h-3 transition-opacity" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="h-11 px-6">Cancel</Button>
                  <Button onClick={handleSaveUser} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8">{isEditMode ? 'Update User' : 'Save User'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Filter:</span>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="w-12 text-center py-4">
                    <Checkbox className="rounded-sm" />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Mail ID</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Role</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Assigned Accounts</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100 h-16">
                      <TableCell className="text-center">
                        <Checkbox className="rounded-sm" />
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase">
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 py-4">{user.email}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className={`
                          rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider
                          ${user.role === 'Admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}
                        `}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {user.assignedAccounts && user.assignedAccounts.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-blue-600 font-medium hover:text-blue-700 hover:underline">
                                {user.assignedAccounts.length} Account{user.assignedAccounts.length > 1 ? 's' : ''}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 bg-white shadow-xl rounded-xl border border-slate-200 ring-1 ring-slate-900/5 z-50 overflow-hidden" align="start">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2">Assigned Accounts</h4>
                                <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                                  {user.assignedAccounts.map((account, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 p-1.5 rounded-md hover:bg-slate-50 transition-colors">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                      <span className="truncate">{account}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-sm text-slate-400 italic">None assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditUser(user)} 
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteUser(user.id, user.name)} 
                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                        <Search className="w-10 h-10 text-slate-300" />
                        <span className="text-lg font-medium text-slate-500">No users found</span>
                        <p className="text-sm text-slate-400">Try adjusting your search or contact an administrator.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
