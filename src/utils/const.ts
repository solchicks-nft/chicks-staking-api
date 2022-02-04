import { config } from 'dotenv';

config();

export const FLEX_END_DAYS = 84;
export const NETWORK_IS_TEST =
  process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'devnet';
export const SOLANA_NETWORK = NETWORK_IS_TEST ? 'devnet' : 'mainnet-beta';
