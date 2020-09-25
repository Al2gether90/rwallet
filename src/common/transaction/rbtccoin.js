import Rsk3 from '@rsksmart/rsk3';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { NETWORK, ASSETS_CONTRACT } from '../constants';
import contractAbi from '../contractAbi.json';

const { MAINNET, TESTNET } = NETWORK;

export const getTransactionFees = async (type, address, toAddress, fee, memo = '') => {
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const rsk3 = new Rsk3(rskEndpoint);
  const from = Rsk3.utils.toChecksumAddress(address);
  const to = Rsk3.utils.toChecksumAddress(toAddress);
  const gas = await rsk3.estimateGas({
    from, to, value: fee, data: memo,
  });
  const latestBlock = await rsk3.getBlock('latest');
  const { minimumGasPrice } = latestBlock;
  const miniGasPrice = new BigNumber(minimumGasPrice, 16);
  return {
    gas: 40000,
    gasPrice: {
      low: miniGasPrice.toString(),
      medium: miniGasPrice.multipliedBy(2).toString(),
      high: miniGasPrice.multipliedBy(4).toString(),
    },
  };
};

export const getContractAddress = async (symbol, type) => {
  if (ASSETS_CONTRACT[symbol] && ASSETS_CONTRACT[symbol][type]) {
    const contractAddress = ASSETS_CONTRACT[symbol][type];
    return Rsk3.utils.toChecksumAddress(contractAddress);
  }
  return '';
};

export const encodeContractTransfer = async (contractAddress, type, from, to, value) => {
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const rsk3 = new Rsk3(rskEndpoint);
  const contract = rsk3.Contract(contractAbi, contractAddress);
  const data = await contract.methods.transfer(to, value).encodeABI();
  return data;
};

export const createRawTransaction = async ({
  symbol, type, sender, receiver, value, memo, gasPrice, gas, contractAddress,
}) => {
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const rsk3 = new Rsk3(rskEndpoint);
  const from = Rsk3.utils.toChecksumAddress(sender);
  const to = Rsk3.utils.toChecksumAddress(receiver);
  const nonce = await rsk3.getTransactionCount(from, 'pending');
  const rawTransaction = {
    from,
    nonce,
    chainId: type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION,
    gas,
    gasPrice,
    value,
  };
  if (symbol === 'RBTC' || !contractAddress) {
    rawTransaction.to = to;
    rawTransaction.data = memo;
  } else {
    const contract = rsk3.Contract(contractAbi, Rsk3.utils.toChecksumAddress(contractAddress));
    rawTransaction.to = contractAddress;
    rawTransaction.data = await contract.methods.transfer(to, value).encodeABI();
    rawTransaction.value = '0x00';
  }
  return rawTransaction;
};

export const getRawTransactionParam = ({
  symbol, netType, sender, receiver, value, data, memo, gasFee, fallback,
}) => {
  const { gasPrice, gas } = gasFee;
  const param = {
    symbol,
    type: netType,
    sender,
    receiver,
    value,
    data,
    gasPrice,
    gas: Math.floor(gas), // gas must be integer
    fallback,
  };
  if (!_.isEmpty(memo)) {
    param.memo = memo;
  }
  return param;
};

export const signTransaction = async (rawTransaction, privateKey) => {
  const rsk3 = new Rsk3('https://public-node.testnet.rsk.co');
  const accountInfo = await rsk3.accounts.privateKeyToAccount(privateKey);
  const signedTransaction = await accountInfo.signTransaction(
    rawTransaction, privateKey,
  );
  console.log(`signedTransaction: ${JSON.stringify(signedTransaction)}`);
  return signedTransaction;
};

export const getSignedTransactionParam = (signedTransaction, netType, memo, coinSwitch) => {
  const param = {
    name: 'Rootstock',
    hash: signedTransaction.rawTransaction,
    type: netType,
  };
  if (!_.isEmpty(memo)) {
    param.memo = memo;
  }
  if (coinSwitch) {
    param.coinSwitch = coinSwitch;
  }
  return param;
};

export const getTxHash = (txResult) => txResult.hash;
