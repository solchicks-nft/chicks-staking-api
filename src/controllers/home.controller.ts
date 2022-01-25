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
      await serviceDb.stake(
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

  public async stake_list(req: Request, res: Response) {
    const {address} = req.query;
    try {
      const serviceDb = new DbService();
      const result = await serviceDb.listStake(address as string);

      // TODO
      return {success: true, data: result.data};
    } catch (e) {
      // console.log(e);
    }

    this.jsonRes({success: true}, res);
  }

  public async unstake(req: Request, res: Response) {
    const {
      address,
      stake_tx_id: stakeTxId,
      unstake_tx_id: unstakeTxId,
    } = req.query;
    try {
      const checkCode = await SolanaService.validateTransaction(
        stakeTxId as string,
      );
      if (checkCode !== SUCCESS) {
        return {success: false, error_code: checkCode};
      }
    } catch (e) {
      return {success: false, error_code: ERROR_TX_INVALID_INPUT_UNKNOWN};
    }

    try {
      const serviceDb = new DbService();
      await serviceDb.unstake(
        address as string,
        stakeTxId as string,
        unstakeTxId as string,
      );
      return {success: true};
    } catch (e) {
      // console.log(e);
    }

    this.jsonRes({success: true}, res);
  }
}
