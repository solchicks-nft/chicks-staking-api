/* eslint-disable */
import { SolanaService } from '../src/services/solana';
import * as anchor from '@project-serum/anchor';
import { Buffer } from 'buffer';
import { toTokenBalanceString } from '../src/utils/helper';
import * as dotenv from 'dotenv';

const BN = require('bn.js');
const { PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

dotenv.config();

const checkTx = async () => {
  console.log('enviroment', process.env.ELB_MODE);

  let program_id = '6BWBw6SNMjYYQ2BB2BA8KxcZrifExt76MguDPg4ktdXW';
  const txId =
    '2cfZPMh1nbyPSfEUsYPWKmWwaxA4tWrM16rut7jW2nodBGqCSVxGJyKmYcMHUZYT4JLbkuSzKycNqcQeS6zXukoj';
  const txInfo = await SolanaService.getTransactionInfo(txId as string);

  if (txInfo) {
    console.log('result', txInfo);
    let instructions = txInfo.transaction.message.instructions;

    // @ts-ignore
    let accountKeys = txInfo.transaction.message.accountKeys;
    const userWalletKey = accountKeys[0];
    console.log('userWalletKey', userWalletKey.toString());

    let inputData = bs58.decode(instructions[0].data);
    console.log(inputData);

    let handle = Buffer.from(inputData.slice(15, 15 + 32));
    console.log(handle, handle.toString());

    let bnTxAmount = new BN(
      Buffer.from(inputData.slice(15 + 32, 15 + 32 + 8)),
      'hex',
      'le',
    );
    console.log(bnTxAmount.toString());

    const [userStakingPubkey] = await anchor.web3.PublicKey.findProgramAddress(
      [userWalletKey.toBuffer(), handle],
      new PublicKey(program_id),
    );
    console.log('userStakingPubkey', userStakingPubkey.toString());

    const userStakingInfo = await SolanaService.getAccountInfo(
      userStakingPubkey,
    );
    console.log('userStakingInfo', userStakingInfo);

    if (userStakingInfo) {
      let bnAmount = new BN(
        Buffer.from(userStakingInfo.data.slice(8, 16)),
        'hex',
        'le',
      );
      console.log(toTokenBalanceString(bnAmount).toString());
      let bnStartTime = new BN(
        Buffer.from(userStakingInfo.data.slice(16, 24)),
        'hex',
        'le',
      );
      console.log(bnStartTime.toString());
      let bnXTokenAmount = new BN(
        Buffer.from(userStakingInfo.data.slice(24, 32)),
        'hex',
        'le',
      );
      console.log(bnXTokenAmount.toString());
      const address = userWalletKey.toString();
      const amount = toTokenBalanceString(bnAmount).toString();
      console.log(
        `https://live-api-staking.solchicks.io/api/flex_stake/?address=${address}&amount=${amount}&tx_id=${txId}&handle=${handle.toString()}&x_token=${bnXTokenAmount.toString()}`,
      );
    } else {
      console.log(`userStakingInfo is null`);
    }
  } else {
    console.log(`txInfo is null`);
  }
};

(() => {
  checkTx().then();
})();
