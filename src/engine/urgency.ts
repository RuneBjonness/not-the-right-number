export type UrgencyLevel = 'normal' | 'warning' | 'danger' | 'critical';

export function getUrgencyLevel(seconds: number): UrgencyLevel {
  if (seconds <= 5) return 'critical';
  if (seconds <= 10) return 'danger';
  if (seconds <= 15) return 'warning';
  return 'normal';
}
