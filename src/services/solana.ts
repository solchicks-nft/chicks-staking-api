import { PublicKey, clusterApiUrl, Connection } from '@solana/web3.js';
import { SOLANA_NETWORK } from '../utils/const';
import { ERROR_TX_INVALID_STATUS, SUCCESS } from './errors';
import { logger } from './winston';
import { sleep } from '../utils/helper';

export class SolanaService {
  public static async getTransactionInfo(txId: string) {
    const connection = new Connection(
      clusterApiUrl(SOLANA_NETWORK),
      'confirmed',
    );
    return await connection.getTransaction(txId);
  }

  public static async getAccountInfo(address: PublicKey) {
    const connection = new Connection(
      clusterApiUrl(SOLANA_NETWORK),
      'confirmed',
    );
    return await connection.getAccountInfo(address);
  }

  public static async validateTransaction(txId: string) {
    let retry = 0;
    let txInfo;
    while (retry++ < 5) {
      txInfo = await this.getTransactionInfo(txId);
      if (!txInfo) {
        logger.debug(`getTransactionInfo - retrying ${retry}`);
        await sleep(5000);
        continue;
      }
      break;
    }

    if (!txInfo || !txInfo.meta || txInfo.meta.err) {
      return ERROR_TX_INVALID_STATUS;
    }
    return SUCCESS;
  }
}
