import { BaseController } from './base.controller';
import { Request, Response } from 'express';
import { DbService } from '../services/db';
import { logger } from '../services/winston';
import { SolanaService } from '../services/solana';
import {
  ERROR_TX_INVALID_INPUT_UNKNOWN,
  ERROR_UNKNOWN,
  SUCCESS,
} from '../services/errors';

export class LockedStakingController extends BaseController {
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
    const { address, tx_id: txId, amount, x_token } = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(txId as string);
      if (checkCode !== SUCCESS) {
        return { success: false, error_code: checkCode };
      }
    } catch (e) {
      logger.info(`stake -> error: ${JSON.stringify(e)}`);
      return { success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN };
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
      logger.info(`stake -> error: ${JSON.stringify(e)}`);
    }
    return { success: false, error_code: ERROR_UNKNOWN };
  }

  public async _unstake(req: Request) {
    const { address, tx_id: txId, x_token: xToken } = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(txId as string);
      if (checkCode !== SUCCESS) {
        return { success: false, error_code: checkCode };
      }
    } catch (e) {
      return { success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN };
    }

    try {
      const serviceDb = new DbService();
      return await serviceDb.insertUnstakeLocked(
        address as string,
        txId as string,
        xToken as string,
      );
    } catch (e) {
      logger.info(`unstake -> error: ${JSON.stringify(e)}`);
    }

    return { success: false, error_code: ERROR_UNKNOWN };
  }
}
