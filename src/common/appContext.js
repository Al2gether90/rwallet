import I18n from 'react-native-i18n';
import RNSecureStorage from 'rn-secure-storage';
// eslint-disable-next-line import/no-unresolved
import EventEmitter from 'EventEmitter';
import storage from './storage';
import ParseHelper from './parse';

const appContext = {
  loadData() {
    this.walletId = 0;
  },
  data: {
    walletId: 0,
    wallets: [],
    language: I18n.currentLocale(),
    user: null,
    settings: {
      currency: 'USD',
      fingerprint: false,
      language: 'en',
    },
  },
  eventEmitter: new EventEmitter(),
  user: null,
  async set(key, value) {
    this.data[key] = value;
    await storage.save('data', this.data);
  },
  async secureSet(key, value) {
    await RNSecureStorage.set(key, value, {});
  },
  async secureGet(key) {
    const exists = await RNSecureStorage.exists(key);
    if (!exists) {
      return null;
    }
    const value = RNSecureStorage.get(key);
    return value;
  },
  async saveSettings(settings) {
    Object.assign(this.data.settings, settings);
    await this.set('settings', this.data.settings);
    // upload settings
    await ParseHelper.uploadSettings(this.user, this.data.settings);
  },
  async addWallet(wallet) {
    const newWallet = wallet;
    newWallet.id = this.data.walletId;
    await this.setPhrase(newWallet.id, newWallet.phrase);
    delete newWallet.phrase;
    this.data.wallets.push(newWallet);
    await this.set('wallets', this.data.wallets);
    this.data.walletId += 1;
    await this.set('walletId', this.data.walletId);
    // TODO: if upload failed?
    await this.uploadWallets();
    return newWallet.id;
  },
  async uploadWallets() {
    const uploadWallets = [];
    this.data.wallets.forEach((wallet1) => {
      const item = { id: wallet1.id, coins: wallet1.coins };
      uploadWallets.push(item);
    });
    await ParseHelper.uploadWallets(this.user, uploadWallets);
    return this.data.walletId;
  },
  async setPhrase(walletId, phrase) {
    const key = `rwallet_${walletId}`;
    await this.secureSet(key, phrase);
  },
  async getPhrase(walletId) {
    const key = `rwallet_${walletId}`;
    const phrase = await this.secureGet(key);
    return phrase;
  },
};

export default appContext;
