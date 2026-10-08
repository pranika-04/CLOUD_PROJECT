import { CloudServerClient } from '../services/cloudServerClient';
import { SocketService } from '../services/socketService';

export class SimulationManager {
  private static status: 'STOPPED' | 'RUNNING' | 'PAUSED' = 'STOPPED';
  private static loadLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  private static interval: NodeJS.Timeout | null = null;

  public static getStatus() {
    return { status: this.status, loadLevel: this.loadLevel };
  }

  public static start(loadLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'STRESS') {
    this.status = 'RUNNING';
    if (loadLevel !== 'STRESS') {
      this.loadLevel = loadLevel;
    }
    
    if (this.interval) clearInterval(this.interval);
    
    if (loadLevel === 'STRESS') {
      for (let i = 0; i < 50; i++) {
        this.generateRequest();
      }
    } else {
      let delay = 10000;
      if (loadLevel === 'LOW') delay = 8000;
      if (loadLevel === 'MEDIUM') delay = 2500;
      if (loadLevel === 'HIGH') delay = 1000;

      this.interval = setInterval(() => {
        if (this.status === 'RUNNING') {
          this.generateRequest();
        }
      }, delay);
    }

    SocketService.emit('SIMULATION_STATUS', this.getStatus());
  }

  public static pause() {
    this.status = 'PAUSED';
    SocketService.emit('SIMULATION_STATUS', this.getStatus());
  }

  public static stop() {
    this.status = 'STOPPED';
    if (this.interval) clearInterval(this.interval);
    SocketService.emit('SIMULATION_STATUS', this.getStatus());
  }

  public static async processManualRequest(req: any) {
    return await CloudServerClient.requestResource(req);
  }

  private static async generateRequest() {
    const types = ['CPU', 'GPU', 'MIXED'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const cpuRequired = Math.floor(Math.random() * 80) + 10;
    const gpuRequired = type === 'GPU' || type === 'MIXED' ? Math.floor(Math.random() * 90) + 10 : 0;
    const ramRequired = Math.floor(Math.random() * 8) + 1;
    const storageRequired = Math.floor(Math.random() * 50) + 5;
    const estimatedExecutionTime = Math.floor(Math.random() * 15) + 5;
    const urgency = Math.floor(Math.random() * 100);

    const taskReq = {
      taskName: `Auto Task ${Math.floor(Math.random() * 1000)}`,
      taskType: type,
      cpuRequired,
      gpuRequired,
      ramRequired,
      storageRequired,
      estimatedExecutionTime,
      urgency
    };

    await CloudServerClient.requestResource(taskReq);
  }
}
