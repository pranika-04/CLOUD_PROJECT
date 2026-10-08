import { CloudTask } from '../types';
import { AllocationEngine } from './allocationEngine';
import { resourceManager } from '../resources/resourceManager';
import { SocketService } from '../services/socketService';

export class QueueEngine {
  public static queue: CloudTask[] = [];
  public static runningTasks: CloudTask[] = [];
  public static completedTasks: CloudTask[] = [];
  public static failedTasks: CloudTask[] = [];
  public static allTasks: CloudTask[] = []; // To serve /cloud/tasks

  public static addTaskToQueue(task: CloudTask, reason: string) {
    task.status = 'WAITING';
    task.waitReason = reason;
    this.queue.push(task);
    if (!this.allTasks.find(t => t.requestId === task.requestId)) {
        this.allTasks.push(task);
    }
    this.sortQueue();
    SocketService.emit('QUEUE_UPDATED', this.getQueueStats());
  }

  public static sortQueue() {
    this.queue.sort((a, b) => {
      const effA = a.priorityScore + a.waitingTimeBonus;
      const effB = b.priorityScore + b.waitingTimeBonus;
      if (effA !== effB) {
        return effB - effA;
      }
      return a.createdAt - b.createdAt;
    });
  }

  public static updateAging() {
    let changed = false;
    const now = Date.now();
    for (const task of this.queue) {
      const waitTimeSeconds = Math.floor((now - task.createdAt) / 1000);
      const bonus = Math.floor(waitTimeSeconds / 5);
      if (task.waitingTimeBonus !== bonus) {
        task.waitingTimeBonus = bonus;
        changed = true;
      }
    }
    if (changed) {
      this.sortQueue();
      SocketService.emit('QUEUE_UPDATED', this.getQueueStats());
    }
  }

  public static processQueue() {
    if (this.queue.length === 0) return;

    let allocatedAny = false;
    for (let i = 0; i < this.queue.length; i++) {
      const task = this.queue[i];
      const suitability = AllocationEngine.calculateSuitability(task);
      
      if (suitability.suitable) {
        const allocated = AllocationEngine.allocateTask(task);
        if (allocated) {
          this.queue.splice(i, 1);
          i--;
          this.startTask(task);
          allocatedAny = true;
        }
      } else {
        task.waitReason = suitability.reason;
      }
    }
    if (allocatedAny) {
      SocketService.emit('QUEUE_UPDATED', this.getQueueStats());
    }
  }

  public static startTask(task: CloudTask) {
    task.status = 'RUNNING';
    task.startedAt = Date.now();
    this.runningTasks.push(task);
    if (!this.allTasks.find(t => t.requestId === task.requestId)) {
        this.allTasks.push(task);
    }
    
    SocketService.emit('TASK_STARTED', task);
    SocketService.emit('RESOURCE_UPDATED', resourceManager.getState());

    setTimeout(() => {
      this.completeTask(task);
    }, task.estimatedExecutionTime * 1000);
  }

  public static completeTask(task: CloudTask) {
    const success = resourceManager.release(task.requestId);
    if (success) {
      task.status = 'COMPLETED';
      task.completedAt = Date.now();
      this.completedTasks.push(task);
      SocketService.emit('TASK_COMPLETED', task);
    } else {
      task.status = 'FAILED';
      this.failedTasks.push(task);
      SocketService.emit('TASK_FAILED', task);
    }
    
    this.runningTasks = this.runningTasks.filter(t => t.requestId !== task.requestId);
    SocketService.emit('RESOURCE_UPDATED', resourceManager.getState());
    
    this.processQueue();
  }

  public static getQueueStats() {
    return {
      length: this.queue.length,
      highPriority: this.queue.filter(t => t.priority === 'HIGH').length,
      mediumPriority: this.queue.filter(t => t.priority === 'MEDIUM').length,
      lowPriority: this.queue.filter(t => t.priority === 'LOW').length,
      queue: this.queue,
    };
  }

  public static getAllTasks() {
    return this.allTasks;
  }
}

// Start aging interval
setInterval(() => {
  QueueEngine.updateAging();
}, 1000);
