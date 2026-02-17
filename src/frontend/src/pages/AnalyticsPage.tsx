import { useState } from 'react';
import { useGetAllProjects, useGetDailyLogsByProject, useGetPlannedTargets } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: projects } = useGetAllProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<bigint | null>(null);
  const { data: logs } = useGetDailyLogsByProject(selectedProjectId);
  const { data: targets } = useGetPlannedTargets(selectedProjectId);

  const analytics = logs && targets ? calculateAnalytics(logs, targets) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Productivity</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track performance and productivity metrics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a project to view analytics</CardDescription>
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

      {selectedProjectId && analytics.length > 0 ? (
        <div className="grid gap-4">
          {analytics.map((activity, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{activity.activityName}</CardTitle>
                  <Badge className={getStatusColor(activity.productivityPercentage)}>
                    {getStatusLabel(activity.productivityPercentage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Planned</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {activity.plannedQuantity.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">{activity.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Actual</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {activity.actualQuantity.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">{activity.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Productivity</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                      {activity.productivityPercentage.toFixed(1)}%
                      {activity.productivityPercentage >= 100 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : activity.productivityPercentage >= 80 ? (
                        <Minus className="h-5 w-5 text-amber-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-medium">{activity.productivityPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(activity.productivityPercentage, 100)} className="h-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-center">
              No analytics data available yet. Add daily logs and planned targets to see productivity metrics.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function calculateAnalytics(logs: any[], targets: any[]) {
  const activityMap = new Map<string, { planned: number; actual: number; unit: string }>();

  targets.forEach((target) => {
    if (!activityMap.has(target.activityName)) {
      activityMap.set(target.activityName, {
        planned: target.plannedDailyQuantity,
        actual: 0,
        unit: target.unit,
      });
    }
  });

  logs.forEach((log) => {
    const existing = activityMap.get(log.activityName);
    if (existing) {
      existing.actual += log.actualQuantity;
    } else {
      activityMap.set(log.activityName, {
        planned: log.plannedQuantity,
        actual: log.actualQuantity,
        unit: log.unit,
      });
    }
  });

  return Array.from(activityMap.entries()).map(([activityName, data]) => ({
    activityName,
    plannedQuantity: data.planned,
    actualQuantity: data.actual,
    unit: data.unit,
    productivityPercentage: data.planned > 0 ? (data.actual / data.planned) * 100 : 0,
  }));
}

function getStatusColor(productivity: number) {
  if (productivity >= 90) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
  if (productivity >= 75) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
}

function getStatusLabel(productivity: number) {
  if (productivity >= 90) return 'On Track';
  if (productivity >= 75) return 'Slightly Delayed';
  return 'Critical Delay';
}
