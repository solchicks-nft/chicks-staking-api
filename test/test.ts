/* eslint-disable */
import * as dotenv from 'dotenv';
const BN = require('bn.js');
import { SolanaService } from '../src/services/solana';
import * as anchor from '@project-serum/anchor';
import { SUCCESS } from '../src/services/errors';
import {Buffer} from "buffer";
import {toTokenBalanceString, toTokenDisplay} from "../src/utils/helper";
const {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
} = require('@solana/web3.js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');

dotenv.config();

const checkTx = async () => {
  let porgram_id = '6BWBw6SNMjYYQ2BB2BA8KxcZrifExt76MguDPg4ktdXW';
  const txId =
    '5Q3HQAxphB286QhgcXYdw1mhxNH8KgHAMr95EqYYQ53advt16GyitdGRNY1wWPcARLnqguSzaXtL5KW11MgWSjTa';

  // const userWalletKey = 'CvKVfxjLDJ2ewjGK6LKWrNmbS5VQX9XuTkk9Q5WagsP1';
  const txInfo = await SolanaService.getTransactionInfo(txId as string);
  console.log('result', txInfo);

  // @ts-ignore
  let instructions = txInfo.transaction.message.instructions;

  // @ts-ignore
  let accountKeys = txInfo.transaction.message.accountKeys;
  const userWalletKey = accountKeys[0];
  console.log("userWalletKey", userWalletKey.toString());

  let inputData = bs58.decode(instructions[0].data);
  console.log(inputData);

  let handle = Buffer.from(inputData.slice(15, 15 + 32));
  console.log(handle, handle.toString());

  let bnTxAmount = new BN(Buffer.from(inputData.slice(15 + 32, 15 + 32 + 8)), 'hex', 'le');
  console.log(bnTxAmount.toString());

  const [userStakingPubkey, userStakingBump] =
          await anchor.web3.PublicKey.findProgramAddress(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              [userWalletKey.toBuffer(), handle],
              new PublicKey(porgram_id),
          )
  console.log("userStakingPubkey", userStakingPubkey.toString());

  const userStakingInfo = await SolanaService.getAccountInfo(userStakingPubkey);
  console.log("userStakingInfo", userStakingInfo);

  // @ts-ignore
  let bnAmount = new BN(Buffer.from(userStakingInfo.data.slice(8, 16)), 'hex', 'le');
  console.log(toTokenBalanceString(bnAmount).toString());
  // @ts-ignore
  let bnStartTime = new BN(Buffer.from(userStakingInfo.data.slice(16, 24)), 'hex', 'le');
  console.log(bnStartTime.toString());
  // @ts-ignore
  let bnXTokenAmount = new BN(Buffer.from(userStakingInfo.data.slice(24, 32)), 'hex', 'le');
  console.log(bnXTokenAmount.toString());

  const address = userWalletKey.toString();
  const amount = toTokenBalanceString(bnAmount).toString();
  console.log(`https://live-api-staking.solchicks.io/api/flex_stake/?address=${address}&amount=${amount}&tx_id=${txId}&handle=${handle.toString()}&x_token=${bnXTokenAmount.toString()}`)


};

(() => {
  checkTx();
})();
