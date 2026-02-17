import { useState } from 'react';
import { useGetAllProjects, useSetPlannedTargets, useGetPlannedTargets } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Target, Plus, Edit } from 'lucide-react';
import type { PlannedTarget } from '../backend';

export default function PlanningPage() {
  const { data: projects } = useGetAllProjects();
  const setTargets = useSetPlannedTargets();
  const [selectedProjectId, setSelectedProjectId] = useState<bigint | null>(null);
  const { data: existingTargets } = useGetPlannedTargets(selectedProjectId);

  const [formData, setFormData] = useState({
    activityName: '',
    plannedDailyQuantity: '',
    unit: '',
    startDate: '',
    endDate: '',
  });

  const [targets, setTargetsState] = useState<PlannedTarget[]>([]);

  const handleAddTarget = () => {
    if (!formData.activityName || !formData.plannedDailyQuantity || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const newTarget: PlannedTarget = {
      activityName: formData.activityName,
      plannedDailyQuantity: parseFloat(formData.plannedDailyQuantity),
      unit: formData.unit,
      startDate: BigInt(new Date(formData.startDate).getTime() * 1000000),
      endDate: BigInt(new Date(formData.endDate).getTime() * 1000000),
    };

    setTargetsState([...targets, newTarget]);
    setFormData({
      activityName: '',
      plannedDailyQuantity: '',
      unit: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    if (targets.length === 0) {
      toast.error('Please add at least one target');
      return;
    }

    try {
      await setTargets.mutateAsync({ projectId: selectedProjectId, targets });
      toast.success('Planned targets saved successfully!');
      setTargetsState([]);
    } catch (error: any) {
      console.error('Save targets error:', error);
      toast.error(error.message || 'Failed to save targets');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Planning</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Set planned targets for project activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a project to manage planned targets</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProjectId?.toString() || ''}
            onValueChange={(value) => setSelectedProjectId(BigInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id.toString()} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProjectId && existingTargets && existingTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Existing Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingTargets.map((target, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{target.activityName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Daily Target: {target.plannedDailyQuantity} {target.unit}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(Number(target.startDate) / 1000000).toLocaleDateString()} -{' '}
                        {new Date(Number(target.endDate) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProjectId && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Target</CardTitle>
            <CardDescription>Define planned daily quantities for activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="activityName">Activity Name</Label>
                <Input
                  id="activityName"
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="e.g., Concrete Pouring, Brickwork"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedDailyQuantity">Planned Daily Quantity</Label>
                <Input
                  id="plannedDailyQuantity"
                  type="number"
                  step="0.01"
                  value={formData.plannedDailyQuantity}
                  onChange={(e) => setFormData({ ...formData, plannedDailyQuantity: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., m³, m², kg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <Button type="button" onClick={handleAddTarget} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add to Plan
            </Button>

            {targets.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold">Targets to Save ({targets.length})</h4>
                {targets.map((target, index) => (
                  <div
                    key={index}
                    className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{target.activityName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {target.plannedDailyQuantity} {target.unit}/day
                    </p>
                  </div>
                ))}
                <Button onClick={handleSave} disabled={setTargets.isPending} className="w-full">
                  {setTargets.isPending ? 'Saving...' : 'Save Plan'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
