import {config} from 'dotenv';
import dateFns from 'date-fns';

import {SupabaseClient, createClient} from '@supabase/supabase-js';
import {logger} from './winston';
import {ERROR_DB_DUPLICATED, ERROR_DB_UNKNOWN} from './errors';
import {END_DAYS} from '../utils/const';

config();
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

const TBL_NAME_STAKE = 'stake_list';
const ACTION_STAKE = 1;
const ACTION_UNSTAKE = 2;

export class DbService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async fetchState(limit = 500) {
    return this.supabase
      .from(TBL_NAME_STAKE)
      .select()
      .match({is_updated: 1})
      .limit(limit)
      .order('last_updated_at', {ascending: true});
  }

  public async insertStake(address: string, txId: string, amount: string) {
    return this._insertStake(address, txId, amount);
  }

  public async insertUnstake(address: string, txId: string, amount: string) {
    return this._insertStake(address, txId, amount, false);
  }

  private async _insertStake(
    address: string,
    txId: string,
    amount: string,
    isStake = true,
  ) {
    const now = new Date();
    const stakeStartDate = dateFns.format(now, 'yyyy-MM-dd HH:mm:ss');
    const stakeEndDate = dateFns.format(
      dateFns.addDays(now, END_DAYS),
      'yyyy-MM-dd HH:mm:ss',
    );
    logger.info(
      `insertStake -- addr: ${address} tx: ${txId} amount: ${amount}`,
    );

    const stake = await this.supabase.from(TBL_NAME_STAKE).insert({
      address,
      stakeTxHash: txId,
      amountStaked: amount,
      stakeStartDate,
      stakeEndDate,
      isStake: isStake ? ACTION_STAKE : ACTION_UNSTAKE,
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
}
