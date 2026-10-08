import { CloudTask, TaskPriority } from '../types';

export class PriorityEngine {
  public static calculatePriorityScore(task: Partial<CloudTask>): number {
    const cpu = task.cpuRequired || 0;
    const gpu = task.gpuRequired || 0;
    const ram = task.ramRequired || 0;
    const normalizedRam = Math.min((ram / 32) * 100, 100);
    const urgency = task.urgency || 0;

    let score = (0.30 * cpu) + (0.30 * gpu) + (0.20 * normalizedRam) + (0.20 * urgency);
    
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  public static classifyPriority(score: number): TaskPriority {
    if (score <= 40) return 'LOW';
    if (score <= 70) return 'MEDIUM';
    return 'HIGH';
  }
}
