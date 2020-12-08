import { ResourceController } from '../../shared';
import { Request, Response, NextFunction, Router } from 'express';
import { ITask, TaskModel, IUser, UserModel, IChat, ChatModel, MessageModel, MessageWithRepliesModel } from '@app/models';
import { OK, CREATED, NO_CONTENT } from 'http-status-codes';
import { NotFound } from 'http-errors';
import { Document, Schema, Model, Types, model } from 'mongoose';
import { DIContainer, SocketsService } from '@app/services';


export class ChatsController {

  private Controller = new ResourceController<IChat>(ChatModel);

  /**
   * Apply all routes for example
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    // const Controller = new ResourceController<IChat>(ChatModel)
    const router = this.Controller.applyRoutes();


    router.post('/:id/pushMessage', this.pushMessageToChat());

    router.get('/:id/messages', this.getAllChatMessages());

    router.get('/:id/messages/:mid', this.getChatMessage());

    router.post('/:id/messages/:mid', this.pushMessageAsReply());

    return router;
  }

  public getChatMessage(id?: string, mid?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;
        const submodelId: any = mid || req.params.mid;

        const resource = await ChatModel
          .findOne({ _id: modelId }, { messages: { $elemMatch: { _id: Types.ObjectId(submodelId) } } })
          .orFail( new NotFound())
          .exec();

        // resource.messages[0]


        return res
          .status(OK)
          .json(resource.messages[0]);
      } catch (e) {
        next(e);
      }
    };
  }

  public getAllChatMessages(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;
        // const queryOptions = this.Controller.parseQueryParameters(req);

        const resource = await ChatModel
          .aggregate([
            { $match: { _id: Types.ObjectId(modelId) } },
            { $unwind: '$messages' },
            //  {$project: {'messages':1} }, 
            { $sort: { 'messages.timestamp': 1 } },
            {
              $group: {
                // _id: "$_id",
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.timestamp' } },
                messages: { $push: '$messages'}
              }
            },
            { $sort: { '_id': 1 } },
          ]);

        // const resource = await ChatModel
        //   .findOne({ _id: modelId })
        //   .select(['messages'])
        //   .populate(
        //     {
        //       path: 'messages',
        //       options: { sort: { 'messages.timestamp':-1 },
        //       // sort: { _id: 'asc' }
        //     }
        //   )
        //   // .where('messages.type').equals('IMAGE_STATIC')
        //   .sort({ 'messages.timestamp': -1})
        //   // .populate({ path: 'messages', options: { sort: { timestamp:  } } })
        //   .orFail(new NotFound())
        //   .exec();

        return res
          .status(OK)
          .json(resource);

      } catch (e) {
        next(e);
      }
    };
  }

  public pushMessageAsReply(id?: string, mid?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;
        const submodelId: any = mid || req.params.mid;

        // const resource = await ChatModel
        //   .findOneAndUpdate(
        //     { _id: modelId },
        //     { $push: { messages: req.body } },
        //     { new: true, runValidators: true, context: 'query' }
        //   )
        //   .orFail(new NotFound())
        //   .exec();


        const resourceChat = await ChatModel
          .findOne({ _id: modelId }, { messages: { $elemMatch: { _id: Types.ObjectId(submodelId) } } })

        if(!resourceChat) throw new NotFound();

        const message = await new MessageModel(req.body);

        resourceChat.messages[0].replies.push(message);

        await resourceChat.save();


        // Sending a broadcast message to all clients
        const socketService = DIContainer.get(SocketsService);
        socketService.broadcast(`/${modelId}/newMessageAsReply`, message);

        return res
          .status(OK)
          .json(resourceChat.messages[0].replies);

      } catch (e) {
        next(e);
      }
    };


  }







  
  public pushMessageToChat(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;

        // delete blacklisted properties from body
        const defaultBlacklist = ['_id', 'createdAt', 'updatedAt'];
        for (const key of defaultBlacklist) {
          delete req.body[key];
        }

        // const resource = await ChatModel
        //   .findOneAndUpdate(
        //     { _id: modelId },
        //     { $push: { messages: req.body } },
        //     { new: true, runValidators: true, context: 'query' }
        //   )
        //   .orFail(new NotFound())
        //   .exec();


        const resourceChat = await ChatModel.findOne({ _id: modelId });
        const message = await new MessageWithRepliesModel(req.body);

        resourceChat.messages.push(message);

        const updatedChat = await resourceChat.save();


        // Sending a broadcast message to all clients
        const socketService = DIContainer.get(SocketsService);
        socketService.broadcast(`/${modelId}/newMessage`, message);

        return res
          .status(OK)
          .json(message);

      } catch (e) {
        next(e);
      }
    };


  }
}