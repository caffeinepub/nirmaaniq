import { useState } from 'react';
import { useGetAllProjects, useSubmitDailyLog } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Users, Plus, AlertCircle } from 'lucide-react';
import { Interruption } from '../backend';
import { toast } from 'sonner';
import PhotoUploader from '../components/daily-logs/PhotoUploader';

export default function DailyLogEntryPage() {
  const { data: projects, isLoading: projectsLoading } = useGetAllProjects();
  const submitLog = useSubmitDailyLog();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState('');
  const [actualQuantity, setActualQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [laborers, setLaborers] = useState('');
  const [supervisors, setSupervisors] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);
  const [isInterruptionOpen, setIsInterruptionOpen] = useState(false);

  const [interruptionForm, setInterruptionForm] = useState({
    reason: 'Rain',
    pauseStart: '',
    pauseEnd: '',
  });

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  };

  const totalWorkingHours = calculateHours(startTime, endTime);
  const totalPauseDuration = interruptions.reduce((sum, int) => sum + int.duration, 0);
  const netWorkingHours = totalWorkingHours - totalPauseDuration;

  const handleAddInterruption = () => {
    const duration = calculateHours(interruptionForm.pauseStart, interruptionForm.pauseEnd);
    if (duration <= 0) {
      toast.error('Invalid interruption duration');
      return;
    }

    const newInterruption: Interruption = {
      reason: interruptionForm.reason,
      startTime: interruptionForm.pauseStart,
      endTime: interruptionForm.pauseEnd,
      duration,
    };

    setInterruptions([...interruptions, newInterruption]);
    setInterruptionForm({ reason: 'Rain', pauseStart: '', pauseEnd: '' });
    setIsInterruptionOpen(false);
    toast.success('Interruption added');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      await submitLog.mutateAsync({
        projectId: BigInt(selectedProjectId),
        activityName,
        plannedQuantity: parseFloat(plannedQuantity),
        actualQuantity: parseFloat(actualQuantity),
        unit,
        laborers: BigInt(laborers),
        supervisors: BigInt(supervisors),
        startTime,
        endTime,
        totalWorkingHours,
        interruptions,
        photoIds,
        remarks,
      });

      toast.success('Daily log submitted successfully!');
      
      // Reset form
      setSelectedProjectId('');
      setActivityName('');
      setPlannedQuantity('');
      setActualQuantity('');
      setUnit('');
      setLaborers('');
      setSupervisors('');
      setStartTime('');
      setEndTime('');
      setRemarks('');
      setPhotoIds([]);
      setInterruptions([]);
    } catch (error: any) {
      console.error('Submit log error:', error);
      toast.error(error.message || 'Failed to submit daily log');
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Log Entry</h1>
        <p className="text-muted-foreground mt-1">Record daily construction activities and progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="activityName">Activity Name *</Label>
                <Input
                  id="activityName"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g., Concrete Pouring"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
                <Input
                  id="plannedQuantity"
                  type="number"
                  step="0.01"
                  value={plannedQuantity}
                  onChange={(e) => setPlannedQuantity(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualQuantity">Actual Quantity *</Label>
                <Input
                  id="actualQuantity"
                  type="number"
                  step="0.01"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., m³, kg, units"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laborers">Labor Count *</Label>
                <Input
                  id="laborers"
                  type="number"
                  value={laborers}
                  onChange={(e) => setLaborers(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisors">Supervisor Count *</Label>
                <Input
                  id="supervisors"
                  type="number"
                  value={supervisors}
                  onChange={(e) => setSupervisors(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Total Hours</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{totalWorkingHours.toFixed(2)}h</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Pause Duration</p>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-foreground">{totalPauseDuration.toFixed(2)}h</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Net Working Hours</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="font-semibold text-accent">{netWorkingHours.toFixed(2)}h</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Interruptions</CardTitle>
            <Dialog open={isInterruptionOpen} onOpenChange={setIsInterruptionOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interruption
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Interruption</DialogTitle>
                  <DialogDescription>Record a work interruption or delay</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Select
                      value={interruptionForm.reason}
                      onValueChange={(value) => setInterruptionForm({ ...interruptionForm, reason: value })}
                    >
                      <SelectTrigger id="reason">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rain">Rain</SelectItem>
                        <SelectItem value="Material Delay">Material Delay</SelectItem>
                        <SelectItem value="Equipment Breakdown">Equipment Breakdown</SelectItem>
                        <SelectItem value="Accident">Accident</SelectItem>
                        <SelectItem value="Inspection Delay">Inspection Delay</SelectItem>
                        <SelectItem value="Power Failure">Power Failure</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pauseStart">Pause Start</Label>
                      <Input
                        id="pauseStart"
                        type="time"
                        value={interruptionForm.pauseStart}
                        onChange={(e) => setInterruptionForm({ ...interruptionForm, pauseStart: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pauseEnd">Pause End</Label>
                      <Input
                        id="pauseEnd"
                        type="time"
                        value={interruptionForm.pauseEnd}
                        onChange={(e) => setInterruptionForm({ ...interruptionForm, pauseEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInterruptionOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddInterruption}>
                    Add Interruption
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {interruptions.length > 0 ? (
              <div className="space-y-2">
                {interruptions.map((int, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium text-sm">{int.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {int.startTime} - {int.endTime}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600">{int.duration.toFixed(2)}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No interruptions recorded</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader photoIds={photoIds} onChange={setPhotoIds} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes or observations..."
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitLog.isPending}>
            {submitLog.isPending ? 'Submitting...' : 'Submit Daily Log'}
          </Button>
        </div>
      </form>
    </div>
  );
}
