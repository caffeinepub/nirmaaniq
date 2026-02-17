import type { DelayAlert } from './delayDetection';

export interface Suggestion {
  text: string;
  icon: 'users' | 'calendar' | 'search' | 'trending';
}

export function generateSuggestions(delay: DelayAlert): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Low productivity suggests manpower issues
  if (delay.currentProductivity < 60) {
    suggestions.push({
      text: 'Increase manpower allocation to this activity to improve output',
      icon: 'users',
    });
  }

  // Multiple consecutive days suggests workflow issues
  if (delay.consecutiveDays >= 3) {
    suggestions.push({
      text: 'Review workflow and identify bottlenecks in the current process',
      icon: 'trending',
    });
    suggestions.push({
      text: 'Consider rescheduling this activity or adjusting the timeline',
      icon: 'calendar',
    });
  }

  // High interruptions suggest external factors
  if (delay.interruptions >= 3) {
    suggestions.push({
      text: 'Investigate repeated interruptions - address root causes (weather, materials, equipment)',
      icon: 'search',
    });
  }

  // Moderate productivity suggests optimization opportunities
  if (delay.currentProductivity >= 60 && delay.currentProductivity < 80) {
    suggestions.push({
      text: 'Optimize resource allocation and improve coordination between teams',
      icon: 'trending',
    });
  }

  return suggestions;
}
