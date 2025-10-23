import { useEffect, useState } from 'react';
import { supabase, Employee } from '../utils/supabase/client';
import {
  Search,
  Plus,
  Monitor,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: '',
    computer_name: '',
  });

  useEffect(() => {
    loadEmployees();
    
    // Real-time subscription
    const channel = supabase
      .channel('employees_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        loadEmployees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, statusFilter]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading employees:', error);
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = async () => {
    try {
      const { error } = await supabase.from('employees').insert([
        {
          ...formData,
          status: 'inactive',
        },
      ]);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          employee_id: formData.employee_id,
          activity_type: 'employee_added',
          description: `Employee ${formData.name} added to system`,
        },
      ]);

      setShowAddDialog(false);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', editingEmployee.id);

      if (error) throw error;

      setEditingEmployee(null);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);

      if (error) throw error;
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      department: '',
      computer_name: '',
    });
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      email: employee.email,
      department: employee.department || '',
      computer_name: employee.computer_name || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'inactive':
        return 'bg-slate-400';
      case 'offline':
        return 'bg-red-600';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Employees</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and monitor employee devices
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className="flex items-center gap-2"
              >
                <Circle className="w-3 h-3 fill-green-600 text-green-600" />
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('inactive')}
                className="flex items-center gap-2"
              >
                <Circle className="w-3 h-3 fill-slate-400 text-slate-400" />
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-600">Loading employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery || statusFilter !== 'all'
                ? 'No employees match your filters'
                : 'No employees yet. Add your first employee to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white">
                        {employee.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white">
                        {employee.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {employee.employee_id}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Circle className={`w-3 h-3 ${getStatusColor(employee.status)}`} />
                    <span className="text-slate-600 dark:text-slate-400 capitalize">
                      {employee.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {employee.email}
                  </p>
                  {employee.department && (
                    <Badge variant="secondary">{employee.department}</Badge>
                  )}
                  {employee.computer_name && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Monitor className="w-4 h-4" />
                      <span>{employee.computer_name}</span>
                    </div>
                  )}
                  {employee.last_activity && (
                    <p className="text-slate-500 dark:text-slate-500">
                      Last seen: {new Date(employee.last_activity).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog
        open={showAddDialog || !!editingEmployee}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingEmployee(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                placeholder="EMP001"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Engineering"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="computer_name">Computer Name</Label>
              <Input
                id="computer_name"
                value={formData.computer_name}
                onChange={(e) =>
                  setFormData({ ...formData, computer_name: e.target.value })
                }
                placeholder="DESKTOP-ABC123"
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
              >
                {editingEmployee ? 'Update' : 'Add'} Employee
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingEmployee(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
