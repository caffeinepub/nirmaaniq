import { useState } from 'react';
import { useAssignUserToProject, useGetAllProjects } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

interface ProjectAssignmentsPanelProps {
  projectId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectAssignmentsPanel({ projectId, open, onOpenChange }: ProjectAssignmentsPanelProps) {
  const { data: projects } = useGetAllProjects();
  const assignUser = useAssignUserToProject();
  const [principalInput, setPrincipalInput] = useState('');

  const project = projects?.find(p => p.id === projectId);

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await assignUser.mutateAsync({ projectId, user: principal });
      toast.success('User assigned successfully!');
      setPrincipalInput('');
    } catch (error: any) {
      console.error('Assign user error:', error);
      toast.error(error.message || 'Failed to assign user. Check the principal ID.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team - {project?.name}</DialogTitle>
          <DialogDescription>Assign users to this project</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assigned Team Members ({project?.assignedUsers.length || 0})
            </h4>
            {project && project.assignedUsers.length > 0 ? (
              <div className="space-y-2">
                {project.assignedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                      {user.toString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">No team members assigned yet</p>
            )}
          </div>

          <form onSubmit={handleAssignUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Assign New User (Principal ID)</Label>
              <Input
                id="principal"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                placeholder="Enter principal ID"
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter the Internet Identity principal of the user you want to assign
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={assignUser.isPending}>
                {assignUser.isPending ? 'Assigning...' : 'Assign User'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
