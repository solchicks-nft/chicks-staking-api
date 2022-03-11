import { BaseController } from './base.controller';
import { Request, Response } from 'express';
import { DbService } from '../services/db';
import { logger } from '../services/winston';
import { SolanaService } from '../services/solana';
import {
  ERROR_DB_UNKNOWN,
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

  public async reward(req: Request, res: Response) {
    const ret = await this._reward(req);
    this.jsonRes(ret, res);
  }

  public async list(req: Request, res: Response) {
    const ret = await this._list(req);
    this.jsonRes(ret, res);
  }

  public async summary(req: Request, res: Response) {
    const ret = await this._summary(req);
    this.jsonRes(ret, res);
  }

  public async _stake(req: Request) {
    const {
      pool,
      address,
      tx_id: txId,
      amount,
      handle,
      x_token,
      start_time,
    } = req.query;
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
        parseInt(pool as string),
        address as string,
        txId as string,
        amount as string,
        handle as string,
        x_token as string,
        start_time as string,
      );
    } catch (e) {
      logger.info(`stake -> error: ${JSON.stringify(e)}`);
    }
    return { success: false, error_code: ERROR_UNKNOWN };
  }

  public async _list(req: Request) {
    const { pool, address } = req.query;
    try {
      const serviceDb = new DbService();
      const result = await serviceDb.listLockedStake(
        parseInt(pool as string),
        address as string,
      );

      if (result.error) {
        return { success: false, error_code: ERROR_DB_UNKNOWN };
      }
      return { success: true, data: result.data };
    } catch (e) {
      logger.info(`list -> error: ${JSON.stringify(e)}`);
    }
    return { success: false, error_code: ERROR_UNKNOWN };
  }

  public async _unstake(req: Request) {
    const { pool, address, handle, tx_id: unstakeTxId } = req.query;
    // noinspection DuplicatedCode
    logger.info(`unstake -> address: ${address as string}`);
    logger.info(`unstake -> handle: ${handle as string}`);
    logger.info(`unstake -> tx_id: ${unstakeTxId as string}`);
    try {
      const checkCode = await SolanaService.validateTransaction(
        unstakeTxId as string,
      );
      if (checkCode !== SUCCESS) {
        return { success: false, error_code: checkCode };
      }
    } catch (e) {
      return { success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN };
    }

    try {
      const serviceDb = new DbService();
      return await serviceDb.unstakeLocked(
        parseInt(pool as string),
        address as string,
        handle as string,
        unstakeTxId as string,
      );
    } catch (e) {
      logger.info(`unstake -> error: ${JSON.stringify(e)}`);
    }

    return { success: false, error_code: ERROR_UNKNOWN };
  }

  public async _reward(req: Request) {
    const { pool, address, handle, tx_id: rewardTxId } = req.query;
    // noinspection DuplicatedCode
    logger.info(`reward -> address: ${address as string}`);
    logger.info(`reward -> handle: ${handle as string}`);
    logger.info(`reward -> tx_id: ${rewardTxId as string}`);
    try {
      const checkCode = await SolanaService.validateTransaction(
        rewardTxId as string,
      );
      if (checkCode !== SUCCESS) {
        return { success: false, error_code: checkCode };
      }
    } catch (e) {
      return { success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN };
    }

    try {
      const serviceDb = new DbService();
      return await serviceDb.rewardLocked(
        parseInt(pool as string),
        address as string,
        handle as string,
        rewardTxId as string,
      );
    } catch (e) {
      logger.info(`reward -> error: ${JSON.stringify(e)}`);
    }

    return { success: false, error_code: ERROR_UNKNOWN };
  }

  public async _summary(req: Request) {
    const { pool } = req.query;
    try {
      const serviceDb = new DbService();
      return await serviceDb.getAllLockedSummary(parseInt(pool as string));
    } catch (e) {
      logger.info(`summary -> error: ${JSON.stringify(e)}`);
    }
    return { success: false, error_code: ERROR_UNKNOWN };
  }
}
