import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class CityGateway {
  @WebSocketServer() wss: Server;

  sendEvent(id: string, event: string, message: string, data: unknown) {
    this.wss.emit(`city-${id}`, {
      event,
      message,
      data
    });
  }
}
