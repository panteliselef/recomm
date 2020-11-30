import * as express from 'express';
import { ResourceController } from '../shared';
import { ITask, TaskModel, IUser, UserModel, IChat, ChatModel } from '@app/models';
import { FilesController } from './files/files.controller';
import { ChatsController } from './chats/chats.controller';
import { SocketEventsController } from './socket-events/socket-events.controller';
import { ExampleController } from './example/example.controller';

const apiV1Router = express.Router();


apiV1Router
  // Sockets events routes
  .use(
    '/socket-events',
    new SocketEventsController().applyRoutes()
  )

  // Sockets events routes
  .use(
    '/files',
    new FilesController().applyRoutes()
  )

  // Task routes
  .use(
    '/tasks',
    new ResourceController<ITask>(TaskModel).applyRoutes()
  )


  // User routes
  .use(
    '/users',
    new ResourceController<IUser>(UserModel).applyRoutes()
  )

  // Chat routes
  .use(
    '/chats',
    new ChatsController().applyRoutes()
  )

  // Example routes
  .use(
    '/example',
    new ExampleController().applyRoutes()
  );


export { apiV1Router };

