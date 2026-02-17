import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { Interruption } from '../../backend';
import { calculateHoursDifference } from '../../lib/timeCalculations';

interface InterruptionsEditorProps {
  interruptions: Interruption[];
  onChange: (interruptions: Interruption[]) => void;
}

const INTERRUPTION_REASONS = [
  'Rain',
  'Material Delay',
  'Equipment Breakdown',
  'Accident',
  'Inspection Delay',
  'Power Failure',
  'Other',
];

export default function InterruptionsEditor({ interruptions, onChange }: InterruptionsEditorProps) {
  const [newInterruption, setNewInterruption] = useState({
    reason: '',
    startTime: '',
    endTime: '',
  });

  const handleAdd = () => {
    if (!newInterruption.reason || !newInterruption.startTime || !newInterruption.endTime) {
      return;
    }

    const duration = calculateHoursDifference(newInterruption.startTime, newInterruption.endTime);

    onChange([
      ...interruptions,
      {
        reason: newInterruption.reason,
        startTime: newInterruption.startTime,
        endTime: newInterruption.endTime,
        duration,
      },
    ]);

    setNewInterruption({ reason: '', startTime: '', endTime: '' });
  };

  const handleRemove = (index: number) => {
    onChange(interruptions.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interruptions</CardTitle>
        <CardDescription>Record any work stoppages or delays</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interruptions.length > 0 && (
          <div className="space-y-2">
            {interruptions.map((interruption, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{interruption.reason}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {interruption.startTime} - {interruption.endTime} ({interruption.duration.toFixed(2)} hours)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-sm">Add Interruption</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={newInterruption.reason} onValueChange={(value) => setNewInterruption({ ...newInterruption, reason: value })}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {INTERRUPTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pauseStart">Pause Start</Label>
              <Input
                id="pauseStart"
                type="time"
                value={newInterruption.startTime}
                onChange={(e) => setNewInterruption({ ...newInterruption, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pauseEnd">Pause End</Label>
              <Input
                id="pauseEnd"
                type="time"
                value={newInterruption.endTime}
                onChange={(e) => setNewInterruption({ ...newInterruption, endTime: e.target.value })}
              />
            </div>
          </div>

          <Button type="button" onClick={handleAdd} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Interruption
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
