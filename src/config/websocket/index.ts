import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { handleCommentEvents } from '@/service/commentSocket.service';

class SocketService {
  private io: Server | null = null;
  static socket = null;
  private static instance: SocketService | null = null;

  constructor() {
    if (SocketService.instance) {
      return SocketService.instance; // Trả về instance đã được tạo trước đó
    }

    SocketService.instance = this;
  }

  initialize(server: HttpServer) {
    if (!this.io) {
      this.io = new Server(server, {
        cors: {
          origin: [
            process.env.NODE_ENV != 'production' && 'http://localhost:3000',
            process.env.NODE_ENV != 'production' && 'http://localhost:5173',
            'https://' + process.env.CLIENT_DOMAIN,
            'https://dash.' + process.env.CLIENT_DOMAIN,
            'https://dashboard.' + process.env.CLIENT_DOMAIN,
            // www
            'https://www.' + process.env.CLIENT_DOMAIN
          ],
          credentials: true
        }
      });
      this.initializeSocketEvents();
    }
  }

  initializeSocketEvents(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      // console.log('Client connected:', socket.id);

      handleCommentEvents(this.io!, socket);

      socket.on('disconnect', () => {
        // console.log('Client disconnected:', socket.id);
      });
    });
  }

  emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitToClient(socketId: string, event: string, data: any): void {
    if (this.io) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    }
  }
}

export default new SocketService();
