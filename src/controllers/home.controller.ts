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

  public async stake(req: Request, res: Response) {
    const {address, tx_id: txId, amount} = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(txId as string);
      if (checkCode !== SUCCESS) {
        return {success: false, error_code: checkCode};
      }
    } catch (e) {
      return {success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN};
    }

    try {
      const serviceDb = new DbService();
      await serviceDb.insertStake(
        address as string,
        txId as string,
        amount as string,
      );
      return {success: true};
    } catch (e) {
      // console.log(e);
    }

    this.jsonRes({success: true}, res);
  }

  public async unstake(req: Request, res: Response) {
    const {address, tx_id: txId, amount} = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(txId as string);
      if (checkCode !== SUCCESS) {
        return {success: false, error_code: checkCode};
      }
    } catch (e) {
      return {success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN};
    }

    try {
      const serviceDb = new DbService();
      await serviceDb.insertUnstake(
        address as string,
        txId as string,
        amount as string,
      );
      return {success: true};
    } catch (e) {
      // console.log(e);
    }

    this.jsonRes({success: true}, res);
  }
}
