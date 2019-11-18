import _ from 'lodash';
import Parse from 'parse/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import config from '../../config';

const parseConfig = config && config.parse;

// If we are unable to load config, it means the config file is moved. Throw error to indicate that.
if (_.isUndefined(parseConfig)) {
  throw new Error('Unable to find config for Parse init. Check config file path!');
}

Parse.initialize(parseConfig.appId, parseConfig.javascriptKey, parseConfig.masterKey);
Parse.serverURL = parseConfig.serverURL;
Parse.masterKey = parseConfig.masterKey;
Parse.setAsyncStorage(AsyncStorage);

/** Parse Class definition */
const ParseUser = Parse.User;

/**
 * ParseHelper is a helper class with static methods which wrap up Parse lib logic,
 * so that we don't need to reference ParseUser, ParseGlobal in other files
 */
class ParseHelper {
  /**
   * Sign in if username is found in backend database; otherwise, sign up
   * @param {*} param0
   * @returns Parse.User object or throw error
   */
  static async signInOrSignUp(appId) {
    try {
      const query = new Parse.Query(Parse.User);
      query.equalTo('username', appId);
      const match = await query.first();

      let user;
      if (_.isUndefined(match)) { // Sign up case
        user = new Parse.User();

        // Set appId as username and password.
        // No real password is needed because we only want to get access to Parse.User here to access related data
        user.set('username', appId);
        user.set('password', appId);

        // TODO: other information needed to be set here.

        user = await user.signUp();
      } else { // Sign in case
        user = await Parse.User.logIn(appId, appId);
      }

      return user;
    } catch (ex) {
      console.error(ex.message);
    }

    return null;
  }

  /**
   * Use user.save() to send wallets to backend server for update.
   * This App doesn't do any comparison, just simply send wallets data
   * @param {ParseUser} user Parse User object retrieved from signInOrSignUp
   * @param {array} wallets A Json array generated by WalletManger.toJson()
   */
  static async uploadWallets(user, wallets) {
    if (user && user instanceof ParseUser) {
      user.set('wallets', wallets);

      await user.save();
    }
  }

  /**
   * Use user.save() to send settings to backend server for update;
   * to be called when user's settings has changed
   *
   * @param {ParseUser} user Parse User object retrieved from signInOrSignUp
   * @param {array} wallets A Json array generated by Settings.toJson()
   */
  static async uploadSettings(user, settings) {
    if (user && user instanceof ParseUser) {
      user.set('wallets', settings);

      await user.save();
    }
  }

  /**
   *
   * @param {object} param
   * @param {string} param.symbol Symbol of token
   * @param {string} param.type type of blockchain, Mainnet or Testnet
   * @param {string} param.sender from address
   * @param {string} param.receiver to address
   * @param {string} param.value amount of token to send
   * @param {string} param.data data field
   */
  static createRawTransaction({
    symbol, type, sender, receiver, value, data,
  }) {
    return Parse.Cloud.run('createRawTransaction', {
      symbol, type, sender, receiver, value, data,
    });
  }

  /**
   * Send a raw transaction to server
   * @param {*} name Blockchain name, e.g. Bitcoin or Rootstock
   * @param {*} hash 0xf8692...dead0a,
   * @param {*} type Mainnet or Testnet
   */
  static sendSignedTransaction(name, hash, type) {
    return Parse.Cloud.run('sendSignedTransaction', { name, hash, type });
  }

  static getServerInfo() {
    return Parse.Cloud.run('getServerInfo');
  }

  /**
   * Transform Parse errors to errors defined by this app
   * @param {object}     err        Parse error from response
   * @returns {object}  error object defined by this app
   * @method handleError
   */
  static handleError(err) {
    const message = err.message || 'error.parse.default';

    switch (err.code) {
      case Parse.Error.INVALID_SESSION_TOKEN:
        return Parse.User.logOut();
        // Other Parse API errors that you want to explicitly handle
      default:
        break;
    }

    return { message };
  }
}

export default ParseHelper;
