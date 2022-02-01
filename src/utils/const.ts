import { config } from 'dotenv';

config();

export const END_DAYS = 60;

export const NETWORK_IS_TEST =
  process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'devnet';

export const SOLANA_NETWORK = NETWORK_IS_TEST ? 'devnet' : 'mainnet-beta';
