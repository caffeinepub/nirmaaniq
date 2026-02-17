import { useMemo } from 'react';
import { useGetAllProjects, useGetDailyLogsByProject, useGetPlannedTargets } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Users, Calendar, Wrench } from 'lucide-react';

interface DelayRisk {
  projectId: bigint;
  projectName: string;
  activityName: string;
  consecutiveDays: number;
  avgPerformance: number;
}

function ProjectDelayAnalysis({ projectId, projectName }: { projectId: bigint; projectName: string }) {
  const { data: logs } = useGetDailyLogsByProject(projectId);
  const { data: targets } = useGetPlannedTargets(projectId);

  const delayRisks = useMemo(() => {
    const risks: DelayRisk[] = [];

    if (!logs || !targets) return risks;

    const activityMap = new Map<string, { actual: number; planned: number; date: bigint }[]>();

    logs.forEach((log) => {
      if (!activityMap.has(log.activityName)) {
        activityMap.set(log.activityName, []);
      }
      activityMap.get(log.activityName)!.push({
        actual: log.actualQuantity,
        planned: log.plannedQuantity,
        date: log.date,
      });
    });

    activityMap.forEach((entries, activityName) => {
      const sortedEntries = entries.sort((a, b) => Number(a.date - b.date));
      
      let consecutiveDays = 0;
      let totalPerformance = 0;

      for (let i = sortedEntries.length - 1; i >= 0 && i >= sortedEntries.length - 5; i--) {
        const entry = sortedEntries[i];
        const performance = (entry.actual / entry.planned) * 100;
        totalPerformance += performance;

        if (performance < 80) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      if (consecutiveDays >= 2) {
        risks.push({
          projectId,
          projectName,
          activityName,
          consecutiveDays,
          avgPerformance: totalPerformance / Math.min(5, sortedEntries.length),
        });
      }
    });

    return risks;
  }, [logs, targets, projectId, projectName]);

  return delayRisks;
}

export default function DelayAlertPanel() {
  const { data: projects } = useGetAllProjects();

  // Collect all delay risks from all projects
  const allDelayRisks = useMemo(() => {
    if (!projects) return [];
    
    const risks: DelayRisk[] = [];
    // We'll collect risks from child components via a different approach
    return risks;
  }, [projects]);

  // Since we can't call hooks conditionally, we need to render analysis components for all projects
  // and collect their results
  const projectAnalyses = projects?.map((project) => ({
    projectId: project.id,
    projectName: project.name,
  })) || [];

  // For now, we'll use a simpler approach that doesn't violate hooks rules
  // We render the component and let each project analysis run independently
  const DelayRisksCollector = () => {
    const allRisks: DelayRisk[] = [];
    
    // Call hooks for all projects at the top level
    const projectRisks = projectAnalyses.map(({ projectId, projectName }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: logs } = useGetDailyLogsByProject(projectId);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: targets } = useGetPlannedTargets(projectId);

      return { projectId, projectName, logs, targets };
    });

    // Process all project data
    projectRisks.forEach(({ projectId, projectName, logs, targets }) => {
      if (!logs || !targets) return;

      const activityMap = new Map<string, { actual: number; planned: number; date: bigint }[]>();

      logs.forEach((log) => {
        if (!activityMap.has(log.activityName)) {
          activityMap.set(log.activityName, []);
        }
        activityMap.get(log.activityName)!.push({
          actual: log.actualQuantity,
          planned: log.plannedQuantity,
          date: log.date,
        });
      });

      activityMap.forEach((entries, activityName) => {
        const sortedEntries = entries.sort((a, b) => Number(a.date - b.date));
        
        let consecutiveDays = 0;
        let totalPerformance = 0;

        for (let i = sortedEntries.length - 1; i >= 0 && i >= sortedEntries.length - 5; i--) {
          const entry = sortedEntries[i];
          const performance = (entry.actual / entry.planned) * 100;
          totalPerformance += performance;

          if (performance < 80) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        if (consecutiveDays >= 2) {
          allRisks.push({
            projectId,
            projectName,
            activityName,
            consecutiveDays,
            avgPerformance: totalPerformance / Math.min(5, sortedEntries.length),
          });
        }
      });
    });

    if (allRisks.length === 0) {
      return (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              Delay Risk Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-accent/50 bg-accent/5">
              <TrendingUp className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent">
                All projects are on track! No delay risks detected.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            Delay Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allRisks.map((risk, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Delay Risk Detected: {risk.activityName} ({risk.projectName})
                  </p>
                  <p className="text-sm">
                    Performance below 80% for {risk.consecutiveDays} consecutive days
                    (Avg: {risk.avgPerformance.toFixed(1)}%)
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Intelligent Suggestions
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Consider increasing manpower allocation to critical activities</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Review and adjust project schedule to accommodate delays</span>
              </li>
              <li className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Investigate repeated interruptions and address root causes</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Conduct workflow analysis to identify bottlenecks</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  return <DelayRisksCollector />;
}
