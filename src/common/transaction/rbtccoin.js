import Rsk3 from '@rsksmart/rsk3';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { NETWORK, ASSETS_CONTRACT } from '../constants';
import assetAbi from '../assetAbi.json';

const { MAINNET, TESTNET } = NETWORK;

export const getContractAddress = async (symbol, type) => {
  if (ASSETS_CONTRACT[symbol] && ASSETS_CONTRACT[symbol][type]) {
    const contractAddress = ASSETS_CONTRACT[symbol][type];
    const networkId = type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION;
    return Rsk3.utils.toChecksumAddress(contractAddress, networkId);
  }
  return '';
};

export const encodeContractTransfer = async (contractAddress, type, to, value) => {
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const networkId = type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION;
  const rsk3 = new Rsk3(rskEndpoint);
  const contract = rsk3.Contract(assetAbi, Rsk3.utils.toChecksumAddress(contractAddress, networkId));
  const data = await contract.methods.transfer(to, value).encodeABI();
  return data;
};

export const getTransactionFees = async (type, coin, address, toAddress, value, memo) => {
  const { symbol, contractAddress } = coin;
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const networkId = type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION;
  const rsk3 = new Rsk3(rskEndpoint);
  const latestBlock = await rsk3.getBlock('latest');
  const { minimumGasPrice } = latestBlock;
  const miniGasPrice = new BigNumber(minimumGasPrice, 16);
  const from = Rsk3.utils.toChecksumAddress(address, networkId);
  const to = Rsk3.utils.toChecksumAddress(toAddress, networkId);

  // Set default gas to 40000
  let gas = 40000;
  if (symbol === 'RBTC') {
    gas = await rsk3.estimateGas({
      from, to, value, data: memo,
    });
  } else {
    const contractAddr = contractAddress || await getContractAddress(symbol, type);
    const data = await encodeContractTransfer(contractAddr, type, to, value);
    gas = await rsk3.estimateGas({
      from, to: contractAddr, value: 0, data,
    });
  }
  return {
    gas,
    gasPrice: {
      low: miniGasPrice.toString(),
      medium: miniGasPrice.multipliedBy(2).toString(),
      high: miniGasPrice.multipliedBy(4).toString(),
    },
  };
};

export const createRawTransaction = async ({
  symbol, type, sender, receiver, value, memo, gasPrice, gas, contractAddress,
}) => {
  const rskEndpoint = type === 'Mainnet' ? MAINNET.RSK_END_POINT : TESTNET.RSK_END_POINT;
  const networkId = type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION;
  const rsk3 = new Rsk3(rskEndpoint);
  const from = Rsk3.utils.toChecksumAddress(sender, networkId);
  const to = Rsk3.utils.toChecksumAddress(receiver, networkId);
  const nonce = await rsk3.getTransactionCount(from, 'pending');
  const rawTransaction = {
    from,
    nonce,
    chainId: type === 'Mainnet' ? MAINNET.NETWORK_VERSION : TESTNET.NETWORK_VERSION,
    gas,
    gasPrice,
    value,
  };
  if (symbol === 'RBTC') {
    rawTransaction.to = to;
    rawTransaction.data = memo;
  } else if (contractAddress) {
    const contract = rsk3.Contract(assetAbi, Rsk3.utils.toChecksumAddress(contractAddress, networkId));
    rawTransaction.to = contractAddress;
    rawTransaction.data = await contract.methods.transfer(to, value).encodeABI();
    rawTransaction.value = '0x00';
  } else {
    throw new Error(`Contract address for ${symbol} is undefined.`);
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
