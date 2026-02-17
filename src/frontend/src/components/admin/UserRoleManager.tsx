import { useState } from 'react';
import { useAssignRole } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Principal } from '@dfinity/principal';
import { StandardizedRole } from '../../backend';
import { toast } from 'sonner';
import { getRoleLabel } from '../../lib/roles';

interface UserRoleManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserRoleManager({ open, onOpenChange }: UserRoleManagerProps) {
  const assignRole = useAssignRole();
  const [principalInput, setPrincipalInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<StandardizedRole>(StandardizedRole.site_engineer);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await assignRole.mutateAsync({ user: principal, role: selectedRole });
      toast.success('Role assigned successfully!');
      setPrincipalInput('');
      setSelectedRole(StandardizedRole.site_engineer);
    } catch (error: any) {
      console.error('Assign role error:', error);
      toast.error(error.message || 'Failed to assign role');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>Assign application roles to users</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssignRole} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">User Principal ID</Label>
            <Input
              id="principal"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              placeholder="Enter principal ID"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Application Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as StandardizedRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StandardizedRole.admin}>{getRoleLabel(StandardizedRole.admin)}</SelectItem>
                <SelectItem value={StandardizedRole.site_engineer}>{getRoleLabel(StandardizedRole.site_engineer)}</SelectItem>
                <SelectItem value={StandardizedRole.project_manager}>{getRoleLabel(StandardizedRole.project_manager)}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admin: Full access | Site Engineer: Add logs | Project Manager: View & plan
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignRole.isPending}>
              {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
