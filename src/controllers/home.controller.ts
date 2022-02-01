import { BaseController } from './base.controller';
import { Request, Response } from 'express';

export class HomeController extends BaseController {
  constructor() {
    super();
  }

  public serverStatus(req: Request, res: Response) {
    this.jsonRes({ success: true }, res);
  }
}
