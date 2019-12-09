/* eslint no-restricted-syntax:0 */
import {
  call, all, takeEvery, put,
} from 'redux-saga/effects';
import _ from 'lodash';

/* Actions */
import actions from './actions';
import walletActions from '../wallet/actions';

/* Component Dependencies */
import ParseHelper from '../../common/parse';
import application from '../../common/application';
import settings from '../../common/settings';
import walletManager from '../../common/wallet/walletManager';
import walletMock from '../../mock/wallet';
// import storage from '../../common/storage';

function* initAppRequest(/* action */) {
  try {
    // yield call(storage.remove, 'wallets');

    // 1. Deserialize Settings from permenate storage
    yield call(settings.deserialize);

    // Sets state in reducer for success
    yield put({
      type: actions.SET_SETTINGS,
      value: settings,
    });

    // 2. Deserialize Wallets from permenate storage
    yield call(walletManager.deserialize);
    console.log('initAppRequest, walletManager: ', walletManager);

    // Sets state in reducer for success
    yield put({
      type: walletActions.SET_WALLET_MANAGER,
      value: walletManager,
    });

    // 3. Deserialize appId from permenate storage
    console.log('application', application);
    yield call(application.deserialize);

    console.log('initAppRequest, appId:', application.get('id'));

    yield put({
      type: actions.SET_APPLICATION,
      value: application,
    });
  } catch (err) {
    const { message } = err; // TODO: handle app error in a class

    console.error(message);

    yield put({
      type: actions.SET_ERROR,
      value: { message },
    });
  }

  try {
    // 1. Test server connection and get Server info
    const response = yield call(ParseHelper.getServerInfo);

    console.log('initAppRequest got response, response: ', response);

    // Sets state in reducer for success
    yield put({
      type: actions.GET_SERVER_INFO_RESULT,
      value: response,
    });

    const appId = application.get('id');

    // 2. Sign in or sign up to get Parse.User object
    // ParseHelper will have direct access to the User object so we don't need to pass it to state here
    try {
      yield call(ParseHelper.signIn, appId);
    } catch (err) {
      if (err.message === 'Invalid username/password.') { // Call sign up if we can't log in using appId
        yield call(ParseHelper.signUp, appId);
      }
    }

    // 3. Upload wallets and settings to server
    try {
      const updatedParseUser = yield call(ParseHelper.updateUser, { wallets: walletManager.wallets, settings: settings.toJSON() });
      console.log('Parse User updated:', updatedParseUser);

      // Update coin's objectId and return isDirty true if there's coin updated
      const addressesJSON = _.map(updatedParseUser.get('wallets'), (wallet) => wallet.toJSON());
      const isDirty = walletManager.updateCoinObjectIds(addressesJSON);

      // If Coins are updated then we need to serialize them
      if (isDirty) {
        console.log('walletManager is dirty, serialize ...', walletManager);
        yield call(walletManager.serialize);
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    const message = yield call(ParseHelper.handleError, err);

    console.error(message);
  }
}

function* getServerInfoRequest(action) {
  const { value } = action;

  console.log('getServerInfoRequest is triggered, value: ', value); // This is undefined

  try {
    const response = yield call(ParseHelper.getServerInfo);

    console.log('getServerInfoRequest got response, response: ', response);

    // Sets state in reducer for success
    yield put({
      type: actions.GET_SERVER_INFO_RESULT,
      value: response,
    });
  } catch (err) {
    const message = yield call(ParseHelper.handlError, err);

    console.error(message);
    // On error, also sets state in reducer
    // so UI could reflect those errors
    // Note that error value here is to be consumed by UI,
    // so it should be an object contains at least a message field
    yield put({
      type: actions.SET_ERROR,
      value: { message },
    });
  }
}

function* getTransactions(action) {
  const { payload } = action;

  console.log('getTransactions is triggered, value: ', payload); // This is undefined

  try {
    // const response = yield call(ParseHelper.getTransactionsByAddress, payload);
    const response = yield call(walletMock.getTransactionsByAddress, payload);

    console.log('getTransactions got response, response: ', response);

    // Sets state in reducer for success
    yield put({
      type: actions.GET_TRANSACTIONS_RESULT,
      page: payload.page,
      value: response,
    });
  } catch (err) {
    console.log(err);
    const message = yield call(ParseHelper.handleError, err);

    // console.error(message);
    // On error, also sets state in reducer
    // so UI could reflect those errors
    // Note that error value here is to be consumed by UI,
    // so it should be an object contains at least a message field
    yield put({
      type: actions.SET_ERROR,
      value: { message },
    });
  }
}

function* createRawTransaction(action) {
  const { payload } = action;
  console.log('saga::createRawTransaction is triggered, payload: ', payload); // This is undefined
  try {
    const response = yield call(ParseHelper.getTransactionsByAddress, payload);
    console.log('saga::createRawTransaction got response, response: ', response);
    yield put({
      type: actions.CREATE_RAW_TRANSATION_RESULT,
      value: response,
    });
  } catch (err) {
    console.log(err);
    const message = yield call(ParseHelper.handleError, err);
    yield put({
      type: actions.SET_ERROR,
      value: { message },
    });
  }
}

function* setSingleSettingsRequest(action) {
  const { key, value } = action;
  console.log('saga::setSingleSettingsRequest is triggered, key: ', key, ', value:', value);
  try {
    // 1. Set settings by key
    settings.set(key, value);
    console.log('settings', settings);

    // 2. Serialize settings
    yield call(settings.serialize);

    yield put({
      type: actions.SET_SETTINGS,
      value: settings,
    });
  } catch (err) {
    console.log(err);

    yield put({
      type: actions.SET_ERROR,
      value: { message: err.message },
    });
  }
}

export default function* () {
  yield all([
    // When app loading action is fired, try to fetch server info
    takeEvery(actions.INIT_APP, initAppRequest),
    takeEvery(actions.GET_SERVER_INFO, getServerInfoRequest),
    takeEvery(actions.GET_TRANSACTIONS, getTransactions),
    takeEvery(actions.CREATE_RAW_TRANSATION, createRawTransaction),
    takeEvery(actions.SET_SINGLE_SETTINGS, setSingleSettingsRequest),
  ]);
}
