import { config } from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './winston';
import { ERROR_DB_DUPLICATED, ERROR_DB_UNKNOWN } from './errors';
import { FLEX_END_DAYS } from '../utils/const';
import { toDateTime, toFixed, toTokenDisplay } from '../utils/helper';
import {start} from "repl";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dateFns = require('date-fns');

config();
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
const TBL_NAME_STAKE_FLEX = 'stake_flex';
const TBL_NAME_STAKE_LOCKED = 'stake_locked';
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
      .match({ address })
      .order('stake_start_date', { ascending: false });
  }

  public async insertStakeFlex(
    address: string,
    txId: string,
    amount: string,
    handle: string,
    xToken: string,
    start_time: string,
  ) {
    const startTime: number = start_time ? parseInt(start_time) : 0;
    const now = startTime > 0 ? new Date(startTime * 1000) : new Date();
    const stakeStartDate = toDateTime(now.getTime());
    const stakeEndDate = toDateTime(
      dateFns.addDays(now, FLEX_END_DAYS).getTime(),
    );
    logger.info(
      `insertStakeFlex -> address: ${address}, tx: ${txId}, amount: ${amount}, handle: ${handle}, xToken: ${xToken}`,
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
        logger.info(`insertStake -> Conflict error`);
        return { success: false, error_code: ERROR_DB_DUPLICATED };
      } else {
        logger.info(`insertStake -> Unknown error`);
        return { success: false, error_code: ERROR_DB_UNKNOWN };
      }
    }
    return { success: true };
  }

  public async unstakeFlex(
    address: string,
    handle: string,
    unstakeTxId: string,
  ) {
    const now = new Date();
    const stakeClaimDate = toDateTime(now.getTime());
    const result = await this.supabase
      .from(TBL_NAME_STAKE_FLEX)
      .update({
        status: STATUS_CLAIMED,
        unstake_tx_hash: unstakeTxId,
        stake_claim_date: stakeClaimDate,
      })
      .match({ handle, address });
    if (!result || result.error) {
      return { success: false, error_code: ERROR_DB_UNKNOWN };
    }
    return { success: true };
  }

  public async getFlexSummary(offset = 0, limit = 1000) {
    return this.supabase.rpc('summary_stake_flex', {
      param_offset: offset,
      param_limit: limit,
    });
  }

  public async getAllFlexSummary() {
    const allRecords: any[] = [];
    let offset = 0;
    const limit = 10_000;
    while (true) {
      const result = await this.getFlexSummary(offset, limit);
      // noinspection DuplicatedCode
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data.length === 0) {
        break;
      }
      result.data.forEach((item) => {
        const { address, sum_amount, sum_x_amount } = item;
        allRecords.push({
          address,
          token_amount: toFixed(sum_amount),
          xtoken_amount: toTokenDisplay(sum_x_amount),
        });
      });
      offset += limit;
    }
    return { success: true, data: allRecords };
  }

  // Locked pool
  public async listLockedStake(pool: number, address: string) {
    return this.supabase
      .from(TBL_NAME_STAKE_LOCKED)
      .select()
      .match({ pool, address })
      .order('stake_start_date', { ascending: false });
  }

  public async insertStakeLocked(
    pool: number,
    address: string,
    txId: string,
    amount: string,
    handle: string,
    xToken: string,
    start_time: string,
  ) {
    const startTime: number = start_time ? parseInt(start_time) : 0;
    const now = startTime > 0 ? new Date(startTime * 1000) : new Date();
    const stakeStartDate = toDateTime(now.getTime());
    const stakeEndDate = toDateTime(
      dateFns.addDays(now, FLEX_END_DAYS).getTime(),
    );
    logger.info(
      `insertStakeLocked -> address: ${address}, tx: ${txId}, amount: ${amount}, handle: ${handle}, xToken: ${xToken}`,
    );

    const stake = await this.supabase.from(TBL_NAME_STAKE_LOCKED).insert({
      pool,
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
        logger.info(`insertStakeLocked -> Conflict error`);
        return { success: false, error_code: ERROR_DB_DUPLICATED };
      } else {
        logger.info(`insertStakeLocked -> Unknown error`);
        return { success: false, error_code: ERROR_DB_UNKNOWN };
      }
    }
    return { success: true };
  }

  public async unstakeLocked(
    pool: number,
    address: string,
    handle: string,
    unstakeTxId: string,
  ) {
    const now = new Date();
    const stakeClaimDate = toDateTime(now.getTime());
    const result = await this.supabase
      .from(TBL_NAME_STAKE_LOCKED)
      .update({
        status: STATUS_CLAIMED,
        unstake_tx_hash: unstakeTxId,
        stake_claim_date: stakeClaimDate,
      })
      .match({ pool, handle, address });
    if (!result || result.error) {
      return { success: false, error_code: ERROR_DB_UNKNOWN };
    }
    return { success: true };
  }

  public async getLockedSummary(pool: number, offset = 0, limit = 1000) {
    return this.supabase.rpc('summary_stake_locked', {
      param_pool: pool,
      param_offset: offset,
      param_limit: limit,
    });
  }

  public async getAllLockedSummary(pool: number) {
    const allRecords: any[] = [];
    let offset = 0;
    const limit = 10_000;
    while (true) {
      const result = await this.getLockedSummary(pool, offset, limit);
      // noinspection DuplicatedCode
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data.length === 0) {
        break;
      }
      result.data.forEach((item) => {
        const { address, sum_amount, sum_x_amount } = item;
        allRecords.push({
          address,
          token_amount: toFixed(sum_amount),
          xtoken_amount: toTokenDisplay(sum_x_amount),
        });
      });
      offset += limit;
    }
    return { success: true, data: allRecords };
  }
}
