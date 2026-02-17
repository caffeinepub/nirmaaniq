import { useState } from 'react';
import { useGetAllProjects, useCreateProject, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Calendar, Plus } from 'lucide-react';
import { ProjectType } from '../backend';
import { toast } from 'sonner';
import UserRoleManager from '../components/admin/UserRoleManager';
import { isAdmin } from '../lib/roles';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useGetAllProjects();
  const { data: userProfile } = useGetCallerUserProfile();
  const createProject = useCreateProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    projectType: ProjectType.residential,
    startDate: '',
    plannedCompletionDate: '',
    plannedWorkingHoursPerDay: 8,
    workingDaysPerWeek: 6,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startDate = BigInt(new Date(formData.startDate).getTime() * 1_000_000);
      const plannedCompletionDate = BigInt(new Date(formData.plannedCompletionDate).getTime() * 1_000_000);

      await createProject.mutateAsync({
        name: formData.name,
        location: formData.location,
        projectType: formData.projectType,
        startDate,
        plannedCompletionDate,
        plannedWorkingHoursPerDay: formData.plannedWorkingHoursPerDay,
        workingDaysPerWeek: BigInt(formData.workingDaysPerWeek),
      });

      toast.success('Project created successfully!');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        location: '',
        projectType: ProjectType.residential,
        startDate: '',
        plannedCompletionDate: '',
        plannedWorkingHoursPerDay: 8,
        workingDaysPerWeek: 6,
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      toast.error(error.message || 'Failed to create project');
    }
  };

  const isUserAdmin = userProfile && isAdmin(userProfile.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your construction projects</p>
        </div>
        <div className="flex gap-2">
          {isUserAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsRoleManagerOpen(true)}>
                Manage Roles
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new construction project to your portfolio
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter project name"
                          required
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter project location"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectType">Project Type *</Label>
                        <Select
                          value={formData.projectType}
                          onValueChange={(value) => setFormData({ ...formData, projectType: value as ProjectType })}
                        >
                          <SelectTrigger id="projectType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ProjectType.residential}>Residential</SelectItem>
                            <SelectItem value={ProjectType.commercial}>Commercial</SelectItem>
                            <SelectItem value={ProjectType.infrastructure}>Infrastructure</SelectItem>
                            <SelectItem value={ProjectType.industrial}>Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workingDaysPerWeek">Working Days/Week *</Label>
                        <Input
                          id="workingDaysPerWeek"
                          type="number"
                          min="1"
                          max="7"
                          value={formData.workingDaysPerWeek}
                          onChange={(e) => setFormData({ ...formData, workingDaysPerWeek: parseInt(e.target.value) })}
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
                        <Label htmlFor="plannedCompletionDate">Planned Completion *</Label>
                        <Input
                          id="plannedCompletionDate"
                          type="date"
                          value={formData.plannedCompletionDate}
                          onChange={(e) => setFormData({ ...formData, plannedCompletionDate: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="plannedWorkingHoursPerDay">Planned Working Hours/Day *</Label>
                        <Input
                          id="plannedWorkingHoursPerDay"
                          type="number"
                          min="1"
                          max="24"
                          step="0.5"
                          value={formData.plannedWorkingHoursPerDay}
                          onChange={(e) => setFormData({ ...formData, plannedWorkingHoursPerDay: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createProject.isPending}>
                        {createProject.isPending ? 'Creating...' : 'Create Project'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id.toString()} className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{project.projectType}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                    {project.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(Number(project.startDate) / 1_000_000).toLocaleDateString()} - {new Date(Number(project.plannedCompletionDate) / 1_000_000).toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {project.plannedWorkingHoursPerDay}h/day • {project.workingDaysPerWeek.toString()} days/week
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              {isUserAdmin
                ? 'Create your first project to start tracking construction progress.'
                : 'No projects have been assigned to you yet.'}
            </p>
            {isUserAdmin && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <UserRoleManager open={isRoleManagerOpen} onOpenChange={setIsRoleManagerOpen} />
    </div>
  );
}
