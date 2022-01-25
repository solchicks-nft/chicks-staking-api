import {format} from 'date-fns-tz';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const formatUnits = require('@ethersproject/units').formatUnits;

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toTimestamp = (time: any): number => {
  if (!time) {
    return 0;
  }
  return new Date(time).getTime();
};

export const toDateTime = (ts: number) => {
  return format(
    new Date().setTime(ts < 10000000000 ? ts * 1000 : ts),
    "yyyy-MM-dd'T'HH:mm:ssXXX",
    {timeZone: 'GMT'},
  );
};

export const toDateDisplay = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const toTokenBalanceString = (balance: bigint | string | undefined) => {
  if (balance === undefined) {
    return '';
  }
  let value: bigint;
  if (typeof balance === 'bigint') {
    value = balance;
  } else {
    value = BigInt(balance.toString());
  }
  return formatUnits(value, 9);
};

export const toFixed = (value: string) => {
  return Math.trunc(parseFloat(value) * 100) / 100;
};

export const toTokenDisplay = (balance: bigint | string | undefined) => {
  if (balance === undefined) {
    return 0;
  }
  let value: bigint;
  if (typeof balance === 'bigint') {
    value = balance;
  } else {
    value = BigInt(balance.toString());
  }
  return toFixed(formatUnits(value, 9));
};
