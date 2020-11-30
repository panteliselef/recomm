import { ResourceController } from '../../shared';
import { Request, Response, NextFunction, Router } from 'express';
import { ITask, TaskModel, IUser, UserModel, IChat, ChatModel } from '@app/models';
import { OK, CREATED, NO_CONTENT } from 'http-status-codes';
import { NotFound } from 'http-errors';


export class ChatsController {

  Controller = new ResourceController<IChat>(ChatModel)

  /**
   * Apply all routes for example
   *
   * @returns {Router}
   */
  public applyRoutes(): Router {
    // const Controller = new ResourceController<IChat>(ChatModel)
    const router = this.Controller.applyRoutes();


    router.post('/:id/pushMessage', this.pushMessageToChat())

    router.get('/:id/messages', this.getOne())

    return router;
  }


  public getOne(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;
        // const queryOptions = this.Controller.parseQueryParameters(req);

        const resource = await ChatModel.aggregate([
          { $unwind: '$messages' },
          // {$project: {'service.apps.updates':1}}, 
          { $sort: { 'messages.timestamp': 1 } },
          { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ]);

        // const resource = await ChatModel
        //   .findOne({ _id: modelId })
        //   // .select(['messages'])
        //   // .populate(
        //   //   {
        //   //     path: 'messages',
        //   //     options: { sort: { 'messages.value':-1 },
        //   //     // sort: { _id: 'asc' }
        //   //   }
        //   // )
        //   // .where('messages.type').equals('IMAGE_STATIC')
        //   .sort({ 'messages.value': -1})
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

  public pushMessageToChat(id?: string) {
    return async (req: Request, res: Response, next?: NextFunction): Promise<Response> => {
      try {
        const modelId: any = id || req.params.id;

        // delete blacklisted properties from body
        const defaultBlacklist = ['_id', 'createdAt', 'updatedAt']
        for (const key of defaultBlacklist) {
          delete req.body[key];
        }

        const resource = await ChatModel
          .findOneAndUpdate(
            { _id: modelId },
            { $push: { messages: req.body } },
            { new: true, runValidators: true, context: 'query' }
          )
          .orFail(new NotFound())
          .exec();

        return res
          .status(OK)
          .json(resource);

      } catch (e) {
        next(e);
      }
    }


  }
}


