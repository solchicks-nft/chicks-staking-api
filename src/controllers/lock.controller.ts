import {BaseController} from './base.controller';
import {Response, Request} from 'express';
import {DbService} from '../services/db';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dateFns = require('date-fns');
import {logger} from '../services/winston';
import {SolanaService} from '../services/solana';
import {
  ERROR_DB_UNKNOWN,
  ERROR_TX_INVALID_INPUT_UNKNOWN,
  ERROR_UNKNOWN,
  SUCCESS,
} from '../services/errors';

export class LockController extends BaseController {
  constructor() {
    super();
  }

  public async stake(req: Request, res: Response) {
    const ret = await this._stake(req);
    this.jsonRes(ret, res);
  }

  public async unstake(req: Request, res: Response) {
    const ret = await this._unstake(req);
    this.jsonRes(ret, res);
  }

  public async _stake(req: Request) {
    const {address, tx_id: txId, amount, x_token} = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(txId as string);
      if (checkCode !== SUCCESS) {
        return {success: false, error_code: checkCode};
      }
    } catch (e) {
      logger.info(`Unknown error : ${e}`);
      return {success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN};
    }

    try {
      const serviceDb = new DbService();
      return await serviceDb.insertStakeLocked(
        address as string,
        txId as string,
        amount as string,
        x_token as string,
      );
    } catch (e) {
      logger.info(`Unknown db error : ${e}`);
    }
    return {success: false, error_code: ERROR_UNKNOWN};
  }

  public async _unstake(req: Request) {
    const {address, tx_id: txId, x_token: xToken} = req.query;
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
      return await serviceDb.insertUnstakeLocked(
        address as string,
        txId as string,
        xToken as string,
      );
    } catch (e) {
      // console.log(e);
    }

    return {success: false, error_code: ERROR_UNKNOWN};
  }
}
