import { InfrastructureState, AllocationRequest, TaskAllocation, ResourceUnit } from '../types';

export class ResourceManager {
  private state: InfrastructureState;

  constructor() {
    this.state = {
      cpu: Array.from({ length: 8 }).map((_, i) => ({
        id: `CPU-${String(i + 1).padStart(2, '0')}`,
        type: 'CPU',
        capacity: 100,
        allocated: 0,
        tasks: [],
        status: 'IDLE',
      })),
      gpu: Array.from({ length: 2 }).map((_, i) => ({
        id: `GPU-${String(i + 1).padStart(2, '0')}`,
        type: 'GPU',
        capacity: 100,
        allocated: 0,
        tasks: [],
        status: 'IDLE',
      })),
      ram: { total: 32, allocated: 0 },
      storage: { total: 1024, allocated: 0 },
    };
  }

  public getState(): InfrastructureState {
    return this.state;
  }

  public getAvailableResources() {
    return {
      cpuAvailable: this.state.cpu.reduce((sum, c) => sum + (c.capacity - c.allocated), 0),
      gpuAvailable: this.state.gpu.reduce((sum, g) => sum + (g.capacity - g.allocated), 0),
      ramAvailable: this.state.ram.total - this.state.ram.allocated,
      storageAvailable: this.state.storage.total - this.state.storage.allocated,
    };
  }

  public allocateResource(req: AllocationRequest): TaskAllocation | null {
    const available = this.getAvailableResources();
    if (
      available.cpuAvailable < req.cpuRequired ||
      available.gpuAvailable < req.gpuRequired ||
      available.ramAvailable < req.ramRequired ||
      available.storageAvailable < req.storageRequired
    ) {
      return null; // Not enough total resources
    }

    const taskAllocation: TaskAllocation = {
      taskId: req.taskId,
      cpuAllocations: [],
      gpuAllocations: [],
      ramAllocated: req.ramRequired,
      storageAllocated: req.storageRequired,
    };

    // Allocate CPU
    let cpuRemaining = req.cpuRequired;
    for (const c of this.state.cpu) {
      if (cpuRemaining <= 0) break;
      const cAvail = c.capacity - c.allocated;
      if (cAvail > 0) {
        const amountToTake = Math.min(cAvail, cpuRemaining);
        c.allocated += amountToTake;
        c.tasks.push({ taskId: req.taskId, allocation: amountToTake });
        c.status = 'ACTIVE';
        taskAllocation.cpuAllocations.push({ id: c.id, amount: amountToTake });
        cpuRemaining -= amountToTake;
      }
    }

    // Allocate GPU
    let gpuRemaining = req.gpuRequired;
    for (const g of this.state.gpu) {
      if (gpuRemaining <= 0) break;
      const gAvail = g.capacity - g.allocated;
      if (gAvail > 0) {
        const amountToTake = Math.min(gAvail, gpuRemaining);
        g.allocated += amountToTake;
        g.tasks.push({ taskId: req.taskId, allocation: amountToTake });
        g.status = 'ACTIVE';
        taskAllocation.gpuAllocations.push({ id: g.id, amount: amountToTake });
        gpuRemaining -= amountToTake;
      }
    }

    // Allocate RAM & Storage
    this.state.ram.allocated += req.ramRequired;
    this.state.storage.allocated += req.storageRequired;

    return taskAllocation;
  }

  public releaseResource(taskId: string): void {
    // Release CPU
    for (const c of this.state.cpu) {
      const taskIndex = c.tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex !== -1) {
        const t = c.tasks.splice(taskIndex, 1)[0];
        c.allocated -= t.allocation;
        if (c.allocated === 0) c.status = 'IDLE';
      }
    }
    // Release GPU
    for (const g of this.state.gpu) {
      const taskIndex = g.tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex !== -1) {
        const t = g.tasks.splice(taskIndex, 1)[0];
        g.allocated -= t.allocation;
        if (g.allocated === 0) g.status = 'IDLE';
      }
    }
    
    // We don't track which task took RAM/Storage exactly in `state.ram.tasks`, 
    // but the backend handles it or we could track it here. 
    // To be perfectly accurate, we should track it, but the mock cloud server 
    // assumes the backend will tell us exactly how much to release or we track it.
    // Let's modify so we track allocations internally.
  }

  // To properly release RAM and storage, we should track allocations in this class.
  private activeAllocations: Map<string, TaskAllocation> = new Map();

  public allocate(req: AllocationRequest): TaskAllocation | null {
    const alloc = this.allocateResource(req);
    if (alloc) {
      this.activeAllocations.set(req.taskId, alloc);
    }
    return alloc;
  }

  public release(taskId: string): boolean {
    const alloc = this.activeAllocations.get(taskId);
    if (!alloc) return false;

    this.releaseResource(taskId);
    this.state.ram.allocated -= alloc.ramAllocated;
    this.state.storage.allocated -= alloc.storageAllocated;
    this.activeAllocations.delete(taskId);
    return true;
  }

  public getUtilization() {
    const available = this.getAvailableResources();
    return {
      cpu: (this.state.cpu.reduce((sum, c) => sum + c.allocated, 0) / (this.state.cpu.length * 100)) * 100,
      gpu: (this.state.gpu.reduce((sum, g) => sum + g.allocated, 0) / (this.state.gpu.length * 100)) * 100,
      ram: (this.state.ram.allocated / this.state.ram.total) * 100,
      storage: (this.state.storage.allocated / this.state.storage.total) * 100,
    };
  }
}

export const resourceManager = new ResourceManager();
