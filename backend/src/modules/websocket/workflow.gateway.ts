import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(WorkflowGateway.name);

  handleConnection(client: Socket): void { this.logger.log(`Client connected: ${client.id}`); }
  handleDisconnect(client: Socket): void { this.logger.log(`Client disconnected: ${client.id}`); }

  @SubscribeMessage('joinOrganization')
  joinOrganization(@ConnectedSocket() client: Socket, @MessageBody() payload: { organizationId: string }): void {
    if (!payload.organizationId) return;
    client.join(payload.organizationId);
    client.emit('joinedOrganization', { organizationId: payload.organizationId });
  }

  emitExecutionUpdate(organizationId: string, payload: { executionId: string; workflowId: string; status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' }): void {
    this.server.to(organizationId).emit('workflowExecutionStatus', payload);
  }
}
