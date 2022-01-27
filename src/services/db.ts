import {config} from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dateFns = require('date-fns');

import {SupabaseClient, createClient} from '@supabase/supabase-js';
import {logger} from './winston';
import {ERROR_DB_DUPLICATED, ERROR_DB_UNKNOWN} from './errors';
import {END_DAYS} from '../utils/const';
import {toDateTime} from '../utils/helper';

config();
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

const TBL_NAME_STAKE_FLEX = 'stake_list_flex';
const STATUS_STAKED = 0;
const STATUS_CLAIMED = 2;

export class DbService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async listStake(address: string) {
    return this.supabase
      .from(TBL_NAME_STAKE_FLEX)
      .select()
      .match({status: STATUS_STAKED, address})
      .order('stake_start_date', {ascending: true});
  }

  public async insertStakeFlex(
    address: string,
    txId: string,
    amount: string,
    handle: string,
    xToken: string,
  ) {
    const now = new Date();
    const stakeStartDate = toDateTime(now.getTime());
    const stakeEndDate = toDateTime(dateFns.addDays(now, END_DAYS).getTime());
    logger.info(
      `insertStake -- addr: ${address} tx: ${txId} amount: ${amount}`,
    );

    const stake = await this.supabase.from(TBL_NAME_STAKE_FLEX).insert({
      address,
      stake_tx_hash: txId,
      amount: amount,
      stake_start_date: stakeStartDate,
      stake_end_date: stakeEndDate,
      status: STATUS_STAKED,
      handle,
      x_token: xToken,
    });

    if (
      !stake ||
      stake.status !== 201 ||
      stake.error ||
      !stake.data ||
      !stake.data[0] ||
      !stake.data[0].id
    ) {
      if (stake.statusText === 'Conflict') {
        logger.info(`insertStake -- Conflict error`);
        return {success: false, error_code: ERROR_DB_DUPLICATED};
      } else {
        logger.info(`insertStake -- Unknown error`);
        return {success: false, error_code: ERROR_DB_UNKNOWN};
      }
    }
  }

  public async unstake(
    address: string,
    stakeTxId: string,
    unstakeTxId: string,
  ) {
    const now = new Date();
    const stakeClaimDate = toDateTime(now.getTime());
    await this.supabase
      .from(TBL_NAME_STAKE_FLEX)
      .update({
        status: STATUS_CLAIMED,
        unstake_tx_hash: unstakeTxId,
        stake_claim_date: stakeClaimDate,
      })
      .match({stake_tx_hash: stakeTxId, address});
  }
}
