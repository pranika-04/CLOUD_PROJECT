import { CloudTask } from '../types';
import { resourceManager } from '../resources/resourceManager';

export class AllocationEngine {
  public static calculateSuitability(task: CloudTask): { suitable: boolean, score: number, reason?: string } {
    const resources = resourceManager.getState();
    const available = resourceManager.getAvailableResources();

    if (available.cpuAvailable < task.cpuRequired) return { suitable: false, score: 0, reason: 'Insufficient CPU capacity' };
    if (available.gpuAvailable < task.gpuRequired) return { suitable: false, score: 0, reason: 'Insufficient GPU capacity' };
    if (available.ramAvailable < task.ramRequired) return { suitable: false, score: 0, reason: 'Insufficient RAM capacity' };
    if (available.storageAvailable < task.storageRequired) return { suitable: false, score: 0, reason: 'Insufficient Storage capacity' };

    const cpuAvailScore = (available.cpuAvailable / (resources.cpu.length * 100)) * 100;
    const gpuAvailScore = resources.gpu.length > 0 ? (available.gpuAvailable / (resources.gpu.length * 100)) * 100 : 100;

    const resourceAvailabilityScore = (cpuAvailScore + gpuAvailScore) / 2;
    const suitabilityScore = Math.round(task.priorityScore + (resourceAvailabilityScore * 0.5));

    return { suitable: true, score: suitabilityScore };
  }

  public static allocateTask(task: CloudTask): boolean {
    const allocation = resourceManager.allocate({
      taskId: task.requestId,
      cpuRequired: task.cpuRequired,
      gpuRequired: task.gpuRequired,
      ramRequired: task.ramRequired,
      storageRequired: task.storageRequired
    });
    if (allocation) {
      task.allocations = allocation;
      return true;
    }
    return false;
  }
}
