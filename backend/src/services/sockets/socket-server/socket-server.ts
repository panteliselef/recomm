import http from 'http';
import io from 'socket.io';
import RedisAdapter from 'socket.io-redis';
import { logger } from '@app/utils/logger';
import { config, getHostDomain } from '@app/config/environment';


export class SocketServer {

  public io: io.Server;

  private videoCallsPerChat: any = {}

  constructor() { }

  /**
   * Start the Socket Server.
   *
   * @param {http.Server} server
   */
  public async start(server: http.Server) {
    try {
      // create redis adapter for sockets.io
      const redisAdapter = RedisAdapter({
        host: config.redis.host,
        port: Number(config.redis.port),
        auth_pass: config.redis.password
      });

      // create socket io server
      this.io = io(server, { path: config.sockets.path });

      // attach redis adapter
      this.io.adapter(redisAdapter);

      // log adapter errors
      this.io
        .of('/').adapter
        .on('error', (e: Error) => {
          logger.error('Socket server failed due to: ', e);
        });

      // register events on connect
      this.onConnect();

      logger.info(`Sockets are established on path: ${getHostDomain()}${config.sockets.path}`);

    } catch (e) {
      logger.error('Socket server failed to start', e);
    }
  }

  //#region Private methods

  /**
   * On server connection.
   */
  private onConnect() {
    this.io.on('connection', socket => {
      logger.debug('connection');

      this.onSubscribe(socket);
      this.onUnsubscribe(socket);
      this.onDisconnecting(socket);
      this.onClientEvent(socket);
    });
  }

  /**
   * On subscribe to a channel.
   *
   * @param {io.Socket} socket
   */
  private onSubscribe(socket: io.Socket): void {
    socket.on('subscribe', (data: any) => {
      logger.debug('subscribe');
      logger.log(data)
    });
  }

  /**
   * On unsubscribe from a channel.
   *
   * @param {io.Socket} socket
   */
  private onUnsubscribe(socket: io.Socket): void {
    socket.on('unsubscribe', (data: any) => {
      logger.debug('unsubscribe');
    });
  }

  /**
   * On socket disconnecting.
   *
   * @param {io.Socket} socket
   */
  private onDisconnecting(socket: io.Socket): void {
    socket.on('disconnecting', (reason: any) => {
      logger.debug('disconnecting ' + socket.id);
    });
  }

  /**
   * On client events.
   *
   * @param {io.Socket} socket
   */
  private onClientEvent(socket: io.Socket): void {
    socket.on('client:event', (eventName: string, msg: any) => {
      const chatlId = msg.chat;
      const userId = msg.member;

      if (eventName === 'videocall/join') {
        
        if (this.videoCallsPerChat[chatlId]) this.videoCallsPerChat[chatlId].live_members.push(userId)
        else {
          this.videoCallsPerChat[chatlId] = {
            live_members: [userId]
          }
        }

        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatlId}/videocall/user-joined`, userId);

        // Send back to same socket
        socket.emit('server:event', `${chatlId}/videocall/get-users`, this.videoCallsPerChat);
      }else if(eventName === 'videocall/leave') {
        this.videoCallsPerChat[chatlId].live_members.filter((memberId: string) => memberId !== userId);


        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatlId}/videocall/user-left`, userId);

        // Send back to same socket
        socket.emit('server:event', `${chatlId}/videocall/get-users`, this.videoCallsPerChat);

      }



      logger.debug('client event ' + eventName);
    });
  }

  //#endregion Private methods
  // --------------------------------

}

