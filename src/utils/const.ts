import { config } from 'dotenv';

config();

// Warning: if changing FLEX_END_DAYS value, please update it on HODL API too
export const FLEX_END_DAYS = 56;
export const LOCKED_END_DAYS_MONTH4 = 120;
export const LOCKED_END_DAYS_MONTH8 = 240;
export const LOCKED_END_DAYS_MONTH12 = 360;
export const NETWORK_IS_TEST =
  process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'devnet';
export const SOLANA_NETWORK = NETWORK_IS_TEST ? 'devnet' : 'mainnet-beta';
