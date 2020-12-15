import http from 'http';
import io from 'socket.io';
import RedisAdapter from 'socket.io-redis';
import { logger } from '@app/utils/logger';
import { config, getHostDomain } from '@app/config/environment';

enum UserDevice {
  MOBILE = 'MOBILE',
  TV = 'TV',
  TABLE = 'TABLE',
}

export class SocketServer {

  public io: io.Server;



  private videoCallsPerUser: any = {
    // "5fca49c79a6e9e032a811159": {
    //   chatId: "5fd4ac43ddd9ce020d76f294",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a811158": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a811154": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a811157": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a811156": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a811155": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
    // "5fca49c79a6e9e032a81115a": {
    //   chatId: "5fd8b235f5da670b8625b1d1",
    //   device: UserDevice.MOBILE
    // },
  }

  private videoCallsPerChat: any = {
    "5fd8b235f5da670b8625b1d1": {
      live_members: {
        // "5fca49c79a6e9e032a811159" : {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811158" : {
        //   device: UserDevice.TV,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811154" : {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811157" : {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811156" : {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a811155" : {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
        // "5fca49c79a6e9e032a81115a": {
        //   device: UserDevice.MOBILE,
        //   videoOptions: {
        //     hasCamera: false,
        //     isMuted: false
        //   }
        // },
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
    this.io.on('connection', (socket: io.Socket) => {
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
      const chatId = msg.chat;
      const userId = msg.member;
      const videoOpts = msg.videoOptions;
      const device = msg.device;

      if (eventName === 'videocall/join') {
        
        if (this.videoCallsPerChat[chatId]){

          this.videoCallsPerChat[chatId].live_members[userId] = {
            device,
            videoOptions: videoOpts
          }
        }
        else {
          // this.videoCallsPerChat[chatlId] = {
          //   live_members: [userId]
          // }

          this.videoCallsPerChat[chatId] = {
            live_members: {
              [userId]: {
                device,
                videoOptions: videoOpts
              }
            }
          }
        }

        if(device) {
          this.videoCallsPerUser[userId] = {
            chatId,
            device
          }
        }else {
          this.videoCallsPerUser[userId] = {
            chatId,
            device: UserDevice.MOBILE
          }
        }

        if(device === UserDevice.TV) {
          // Broadvcast to others, not the same socket
          socket.broadcast.emit('server:event', `${userId}/on-tv-call`, this.videoCallsPerUser[userId])
        }

        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatId}/videocall/user-joined`, {member: userId,videoOptions: videoOpts})

        // Send back to same socket
        socket.emit('server:event', `${chatId}/videocall/get-users`, this.videoCallsPerChat);

        // Send back to same socket
        socket.broadcast.emit('server:event', `${userId}/videocall/user-in-chat`, this.videoCallsPerUser[userId]);

        // Send back to all
        this.io.emit('server:event', `${chatId}/videocall/people-in-call`, this.videoCallsPerChat[chatId]);
      }else if(eventName === 'videocall/leave') {
        if (this.videoCallsPerChat[chatId]) {
          if(Object.keys(this.videoCallsPerChat[chatId].live_members).length == 1)
            this.videoCallsPerChat[chatId] = null;
          else {
            this.videoCallsPerChat[chatId].live_members[userId] = null;
            delete this.videoCallsPerChat[chatId].live_members[userId]
          }
        }


        if(this.videoCallsPerUser[userId]) {
          delete this.videoCallsPerUser[userId]
        }
        // this.videoCallsPerChat[chatlId].live_members.filter((memberId: string) => memberId !== userId);


        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatId}/videocall/user-left`, userId);

        // Send back to same socket
        // socket.emit('server:event', `${chatId}/videocall/get-users`, this.videoCallsPerChat[chatId]);

        // Send back to all
        this.io.emit('server:event', `${chatId}/videocall/people-in-call`, this.videoCallsPerChat[chatId]);
      }else if(eventName === 'videocall/update') {
        this.videoCallsPerChat[chatId].live_members[userId] = {
          videoOptions: videoOpts,
          device: device || this.videoCallsPerChat[chatId].live_members[userId].device
        }


        // Broadvcast to others, not the same socket
        socket.broadcast.emit('server:event', `${chatId}/videocall/user-options-updated`, {member: userId,videoOptions: videoOpts});
      }else if(eventName === 'videocall/send-users') {

        // Send back to same socket
        socket.emit('server:event', `${chatId}/videocall/get-users`, this.videoCallsPerChat[chatId]);
        // Send back to all
        this.io.emit('server:event', `${chatId}/videocall/people-in-call`, this.videoCallsPerChat[chatId]);
      }else if(eventName === 'getUser') {

        // Send back to same socket
        socket.emit('server:event', `${userId}/videocall/user-in-chat`, this.videoCallsPerUser[userId]);
      }



      logger.debug('client event ' + eventName);
    });
  }

  //#endregion Private methods
  // --------------------------------

}

