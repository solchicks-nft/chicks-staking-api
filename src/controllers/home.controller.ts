import { BaseController } from './base.controller';
import { Request, Response } from 'express';

export class HomeController extends BaseController {
  constructor() {
    super();
  }

  public serverStatus(req: Request, res: Response) {
    this.jsonRes({ success: true }, res);
  }

  async getEnvironmentSummary(req: Request, res: Response) {
    const result = `ENVIRONMENT: ${process.env.ELB_MODE as string}`;
    this.jsonRes(result, res);
  }
}
