import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Project, DailyLogEntry } from '../../backend';
import { Building2, Users, AlertTriangle } from 'lucide-react';

interface DprViewerProps {
  project: Project;
  logs: DailyLogEntry[];
  date: string;
}

export default function DprViewer({ project, logs, date }: DprViewerProps) {
  const totalLaborers = logs.reduce((sum, log) => sum + Number(log.laborers), 0);
  const totalSupervisors = logs.reduce((sum, log) => sum + Number(log.supervisors), 0);
  const totalInterruptions = logs.reduce((sum, log) => sum + log.interruptions.length, 0);
  const totalQuantity = logs.reduce((sum, log) => sum + log.actualQuantity, 0);

  return (
    <Card className="print:shadow-none">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Daily Progress Report</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{project.name}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Badge>
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Activities</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{logs.length}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalQuantity.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Labor</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalLaborers}</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Interruptions</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalInterruptions}</p>
          </div>
        </div>

        {/* Activities Completed */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Activities Completed
          </h3>
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id.toString()} className="border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-lg">{log.activityName}</h4>
                      <Badge variant="outline">
                        {((log.actualQuantity / log.plannedQuantity) * 100).toFixed(0)}% Complete
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Planned</p>
                        <p className="font-medium">{log.plannedQuantity} {log.unit}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Achieved</p>
                        <p className="font-medium">{log.actualQuantity} {log.unit}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Working Hours</p>
                        <p className="font-medium">{log.netWorkingHours.toFixed(1)} hrs</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Time</p>
                        <p className="font-medium">{log.startTime} - {log.endTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span>{log.laborers.toString()} Laborers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span>{log.supervisors.toString()} Supervisors</span>
                      </div>
                    </div>

                    {log.interruptions.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Interruptions ({log.interruptions.length})
                        </p>
                        <div className="space-y-1">
                          {log.interruptions.map((interruption, idx) => (
                            <div key={idx} className="text-sm text-slate-600 dark:text-slate-400 pl-6">
                              • {interruption.reason}: {interruption.startTime} - {interruption.endTime} ({interruption.duration.toFixed(1)} hrs)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.photoIds.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium mb-3">Photos ({log.photoIds.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {log.photoIds.map((photoId, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={photoId}
                                alt={`Activity photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.remarks && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium mb-1">Remarks</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{log.remarks}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Project Information */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-3">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Location</p>
              <p className="font-medium">{project.location}</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Project Type</p>
              <p className="font-medium capitalize">{project.projectType}</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Total Laborers Deployed</p>
              <p className="font-medium">{totalLaborers}</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Total Supervisors</p>
              <p className="font-medium">{totalSupervisors}</p>
            </div>
          </div>
        </div>

        {/* Productivity Status */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-3">Productivity Status</h3>
          <div className="space-y-2">
            {logs.map((log) => {
              const productivity = (log.actualQuantity / log.plannedQuantity) * 100;
              const status = productivity >= 90 ? 'On Track' : productivity >= 75 ? 'Slightly Delayed' : 'Critical';
              const statusColor = productivity >= 90 ? 'text-green-600' : productivity >= 75 ? 'text-amber-600' : 'text-red-600';

              return (
                <div key={log.id.toString()} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="font-medium">{log.activityName}</span>
                  <span className={`font-semibold ${statusColor}`}>{status} ({productivity.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
