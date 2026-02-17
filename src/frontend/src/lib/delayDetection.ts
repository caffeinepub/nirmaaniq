import type { DailyLogEntry, PlannedTarget, Project } from '../backend';

export interface DelayAlert {
  activityName: string;
  projectName: string;
  consecutiveDays: number;
  currentProductivity: number;
  averageProductivity: number;
  interruptions: number;
}

export function detectDelays(
  logs: DailyLogEntry[],
  targets: PlannedTarget[],
  project: Project
): DelayAlert[] {
  const alerts: DelayAlert[] = [];
  
  // Group logs by activity
  const logsByActivity = logs.reduce((acc, log) => {
    if (!acc[log.activityName]) {
      acc[log.activityName] = [];
    }
    acc[log.activityName].push(log);
    return acc;
  }, {} as Record<string, DailyLogEntry[]>);

  // Check each activity
  Object.entries(logsByActivity).forEach(([activityName, activityLogs]) => {
    const target = targets.find(t => t.activityName === activityName);
    if (!target) return;

    // Sort logs by date (most recent first)
    const sortedLogs = [...activityLogs].sort((a, b) => 
      Number(b.date) - Number(a.date)
    );

    // Check last few days for consecutive low productivity
    let consecutiveLowDays = 0;
    const productivities: number[] = [];
    let totalInterruptions = 0;

    for (let i = 0; i < Math.min(5, sortedLogs.length); i++) {
      const log = sortedLogs[i];
      const productivity = (log.actualQuantity / log.plannedQuantity) * 100;
      productivities.push(productivity);
      totalInterruptions += log.interruptions.length;

      if (productivity < 80) {
        consecutiveLowDays++;
      } else {
        break; // Stop counting if we hit a good day
      }
    }

    // Alert if 2+ consecutive days below 80%
    if (consecutiveLowDays >= 2) {
      const avgProductivity = productivities.reduce((a, b) => a + b, 0) / productivities.length;
      
      alerts.push({
        activityName,
        projectName: project.name,
        consecutiveDays: consecutiveLowDays,
        currentProductivity: productivities[0] || 0,
        averageProductivity: avgProductivity,
        interruptions: totalInterruptions,
      });
    }
  });

  return alerts;
}
