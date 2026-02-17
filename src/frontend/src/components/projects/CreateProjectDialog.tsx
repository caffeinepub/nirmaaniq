import { useState } from 'react';
import { useCreateProject } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectType } from '../../backend';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const createProject = useCreateProject();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    projectType: 'residential' as keyof typeof ProjectType,
    startDate: '',
    plannedCompletionDate: '',
    plannedWorkingHoursPerDay: '8',
    workingDaysPerWeek: '6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.startDate || !formData.plannedCompletionDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const startDate = BigInt(new Date(formData.startDate).getTime() * 1000000);
      const completionDate = BigInt(new Date(formData.plannedCompletionDate).getTime() * 1000000);

      await createProject.mutateAsync({
        name: formData.name,
        location: formData.location,
        projectType: ProjectType[formData.projectType],
        startDate,
        plannedCompletionDate: completionDate,
        plannedWorkingHoursPerDay: parseFloat(formData.plannedWorkingHoursPerDay),
        workingDaysPerWeek: BigInt(formData.workingDaysPerWeek),
      });

      toast.success('Project created successfully!');
      onOpenChange(false);
      setFormData({
        name: '',
        location: '',
        projectType: 'residential',
        startDate: '',
        plannedCompletionDate: '',
        plannedWorkingHoursPerDay: '8',
        workingDaysPerWeek: '6',
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      toast.error(error.message || 'Failed to create project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new construction project to your portfolio</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value as keyof typeof ProjectType })}
              >
                <SelectTrigger id="projectType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingDaysPerWeek">Working Days Per Week *</Label>
              <Input
                id="workingDaysPerWeek"
                type="number"
                min="1"
                max="7"
                value={formData.workingDaysPerWeek}
                onChange={(e) => setFormData({ ...formData, workingDaysPerWeek: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedCompletionDate">Planned Completion Date *</Label>
              <Input
                id="plannedCompletionDate"
                type="date"
                value={formData.plannedCompletionDate}
                onChange={(e) => setFormData({ ...formData, plannedCompletionDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="plannedWorkingHoursPerDay">Planned Working Hours Per Day *</Label>
              <Input
                id="plannedWorkingHoursPerDay"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={formData.plannedWorkingHoursPerDay}
                onChange={(e) => setFormData({ ...formData, plannedWorkingHoursPerDay: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
