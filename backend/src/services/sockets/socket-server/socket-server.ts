import http from 'http';
import io from 'socket.io';
import RedisAdapter from 'socket.io-redis';
import { logger } from '@app/utils/logger';
import { config, getHostDomain } from '@app/config/environment';


export class SocketServer {

  public io: io.Server;

  private videoCallsPerChat: any = {
    "5fd4ac43ddd9ce020d76f294": {
      live_members: {
        // "5fca49c79a6e9e032a811159" : {
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811158" : {
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // }
      }
    }
  }

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
      const videoOpts = msg.videoOptions;

      if (eventName === 'videocall/join') {
        
        if (this.videoCallsPerChat[chatlId]){

          this.videoCallsPerChat[chatlId].live_members[userId] = {
            videoOptions: videoOpts
          }
        }
        else {
          // this.videoCallsPerChat[chatlId] = {
          //   live_members: [userId]
          // }

          this.videoCallsPerChat[chatlId] = {
            live_members: {
              [userId]: {
                videoOptions: videoOpts
              }
            }
          }
        }

        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatlId}/videocall/user-joined`, {member: userId,videoOptions: videoOpts})

        // Send back to same socket
        socket.emit('server:event', `${chatlId}/videocall/get-users`, this.videoCallsPerChat);

        // Send back to all
        this.io.emit('server:event', `${chatlId}/videocall/people-in-call`, this.videoCallsPerChat[chatlId]);
      }else if(eventName === 'videocall/leave') {
        if (this.videoCallsPerChat[chatlId])
          if(Object.keys(this.videoCallsPerChat[chatlId].live_members).length == 1)
            this.videoCallsPerChat[chatlId] = null;
          else
            this.videoCallsPerChat[chatlId].live_members[userId] = null;
        // this.videoCallsPerChat[chatlId].live_members.filter((memberId: string) => memberId !== userId);


        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatlId}/videocall/user-left`, userId);

        // Send back to same socket
        socket.emit('server:event', `${chatlId}/videocall/get-users`, this.videoCallsPerChat);

        // Send back to all
        this.io.emit('server:event', `${chatlId}/videocall/people-in-call`, this.videoCallsPerChat[chatlId]);
      }else if(eventName === 'videocall/update') {
        this.videoCallsPerChat[chatlId].live_members[userId] = {
          videoOptions: videoOpts
        }


        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatlId}/videocall/user-options-updated`, {member: userId,videoOptions: videoOpts});
      }else if(eventName === 'videocall/send-users') {

        // Send back to same socket
        socket.emit('server:event', `${chatlId}/videocall/people-in-call`, this.videoCallsPerChat[chatlId]);
      }



      logger.debug('client event ' + eventName);
    });
  }

  //#endregion Private methods
  // --------------------------------

}

