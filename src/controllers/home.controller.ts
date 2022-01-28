import {BaseController} from './base.controller';
import {Response, Request} from 'express';
import {DbService} from '../services/db';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dateFns = require('date-fns');
import {logger} from '../services/winston';
import {SolanaService} from '../services/solana';
import {ERROR_TX_INVALID_INPUT_UNKNOWN, SUCCESS} from '../services/errors';

export class HomeController extends BaseController {
  constructor() {
    super();
  }

  public serverStatus(req: Request, res: Response) {
    this.jsonRes({success: true}, res);
  }
}
