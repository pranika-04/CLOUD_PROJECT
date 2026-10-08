export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskStatus = 'WAITING' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface CloudTask {
  requestId: string;
  taskName: string;
  taskType: 'CPU' | 'GPU' | 'MIXED';
  priority: TaskPriority;
  priorityScore: number;
  suitabilityScore: number;
  cpuRequired: number; // 0-100
  gpuRequired: number; // 0-100
  ramRequired: number; // GB
  storageRequired: number; // GB
  estimatedExecutionTime: number; // in seconds or milliseconds
  urgency: number; // 0-100
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  status: TaskStatus;
  waitingTimeBonus: number;
  waitReason?: string;
  allocations?: any; // To store resource IDs assigned
}

export interface ResourceState {
  cpuAvailable: number;
  gpuAvailable: number;
  ramAvailable: number;
  storageAvailable: number;
}
