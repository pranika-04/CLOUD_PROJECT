import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static io: SocketServer;

  public static initialize(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: { origin: '*' }
    });

    this.io.on('connection', (socket) => {
      console.log('Cloud Client connected:', socket.id);
    });
  }

  public static emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
