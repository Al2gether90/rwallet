import React, { Component } from 'react';
import {
  View,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WalletTypeList from '../../components/wallet/wallet.type.list';
import flex from '../../assets/styles/layout.flex';

class WalletAddIndex extends Component {
    listData = [
      {
        id: '1',
        title: 'Create Basic Wallet',
        text: 'Recommended for first-time user',
        icon: (<AntDesign name="wallet" size={25} style={{ color: '#515151' }} />),
        onPress: () => {
          const { navigation } = this.props;
          navigation.navigate('WalletSelectCurrency');
        },
      },
      {
        id: '2',
        title: 'Create Share Wallet (Multi-sig)',
        text: 'Requires multiple devices',
        icon: (<MaterialIcons name="computer" size={25} style={{ color: '#515151' }} />),
        onPress: () => {
          const { navigation } = this.props;
          navigation.navigate('WalletSelectCurrency');
        },
      },
      {
        id: '3',
        title: 'Join Share Wallet',
        text: 'Recommended for first-time user',
        icon: (<Feather name="users" size={25} style={{ color: '#515151' }} />),
        onPress: () => {
          const { navigation } = this.props;
          navigation.navigate('WalletSelectCurrency');
        },
      },
      {
        id: '4',
        title: 'Import existing Wallet',
        text: 'Recover your wallet using your passphrase',
        icon: (<AntDesign name="download" size={25} style={{ color: '#515151' }} />),
        onPress: () => {
          const { navigation } = this.props;
          navigation.navigate('WalletSelectCurrency');
        },
      },
    ];

    static navigationOptions = {};

    render() {
      return (
        <View style={[flex.flex1]}>
          <WalletTypeList data={this.listData} />
        </View>
      );
    }
}

export default WalletAddIndex;
