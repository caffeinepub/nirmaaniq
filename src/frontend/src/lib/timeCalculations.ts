export function calculateHoursDifference(startTime: string, endTime: string): number {
  try {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMin - startMin;
    
    // Handle cross-midnight scenarios
    if (hours < 0) {
      hours += 24;
    }
    
    return hours + minutes / 60;
  } catch {
    return 0;
  }
}

export function calculateTotalPauseDuration(interruptions: Array<{ startTime: string; endTime: string }>): number {
  return interruptions.reduce((total, interruption) => {
    return total + calculateHoursDifference(interruption.startTime, interruption.endTime);
  }, 0);
}
