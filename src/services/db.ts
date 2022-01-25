import {config} from 'dotenv';
import dateFns from 'date-fns';

import {SupabaseClient, createClient} from '@supabase/supabase-js';
import {logger} from './winston';
import {ERROR_DB_DUPLICATED, ERROR_DB_UNKNOWN} from './errors';
import {END_DAYS} from '../utils/const';
import {toDateTime} from '../utils/helper';

config();
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

const TBL_NAME_STAKE = 'stake_list';
const STATUS_STAKED = 0;
const STATUS_CLAIMED = 2;

export class DbService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async listStake(address: string) {
    return this.supabase
      .from(TBL_NAME_STAKE)
      .select()
      .match({status: STATUS_STAKED, address})
      .order('stake_start_date', {ascending: true});
  }

  public async stake(address: string, txId: string, amount: string) {
    const now = new Date();
    const stakeStartDate = toDateTime(now.getTime());
    const stakeEndDate = toDateTime(dateFns.addDays(now, END_DAYS).getTime());
    logger.info(
      `insertStake -- addr: ${address} tx: ${txId} amount: ${amount}`,
    );

    const stake = await this.supabase.from(TBL_NAME_STAKE).insert({
      address,
      stake_tx_hash: txId,
      amount: amount,
      stake_start_date: stakeStartDate,
      stake_end_date: stakeEndDate,
      stake: STATUS_STAKED,
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
      .from(TBL_NAME_STAKE)
      .update({
        status: STATUS_CLAIMED,
        unstake_tx_hash: unstakeTxId,
        stake_claim_date: stakeClaimDate,
      })
      .match({stake_tx_hash: stakeTxId, address});
  }
}
