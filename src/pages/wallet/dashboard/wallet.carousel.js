import React from 'react';
import {
  Image,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

import PropTypes from 'prop-types';
import Carousel from './carousel';
import WalletPage from './wallet.carousel.page.wallet';
import { screen } from '../../../common/info';
import references from '../../../assets/references';

const WALLET_PAGE_WIDTH = screen.width - 50;

const styles = StyleSheet.create({
  carousel: {
  },
  item: {
    borderWidth: 2,
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    borderColor: 'white',
    elevation: 3,
  },
  imageBackground: {
    flex: 2,
    backgroundColor: '#EBEBEB',
    borderWidth: 5,
    borderColor: 'white',
  },
  rightTextContainer: {
    marginLeft: 'auto',
    marginRight: -2,
    backgroundColor: 'rgba(49, 49, 51,0.5)',
    padding: 3,
    marginTop: 3,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  rightText: { color: 'white' },
  lowerContainer: {
    flex: 1,
    margin: 10,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  contentText: {
    marginTop: 10,
    fontSize: 12,
  },
  addWalletButtonView: {
    flex: 1,
  },
  addWalletText: {
    color: '#FFF',
    fontFamily: 'Avenir-Medium',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  addWalletButton: {
    backgroundColor: 'rgba(255,255,255, 0.5)',
    borderRadius: 12,
    height: 166,
    marginTop: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const WalletCarousel = (props) => {
  const { data, navigation } = props;
  data.unshift({ index: -1 });

  const renderItem = ({ item }) => {
    const {
      walletData, onSendPressed, onReceivePressed, onSwapPressed,
      onAddAssetPressed, currencySymbol, index,
    } = item;
    if (index < 0) {
      return (
        <View style={[styles.addWalletButtonView]}>
          <TouchableOpacity style={styles.addWalletButton} onPress={() => navigation.navigate('WalletAddIndex')}>
            <Image source={references.images.addWallet} />
            <Text style={[styles.addWalletText]}>
              Add Wallet
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <WalletPage
        walletData={walletData}
        onSendPressed={onSendPressed}
        onReceivePressed={onReceivePressed}
        onSwapPressed={onSwapPressed}
        onAddAssetPressed={onAddAssetPressed}
        currencySymbol={currencySymbol}
      />
    );
  };

  return (
    <Carousel
      style={styles.carousel}
      data={data}
      renderItem={renderItem}
      itemWidth={WALLET_PAGE_WIDTH}
      inActiveOpacity={0.5}
      containerWidth={screen.width}
      initialIndex={1}
    />
  );
};

WalletCarousel.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    pop: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
  }).isRequired,
  item: PropTypes.shape({
    walletData: PropTypes.object.isRequired,
    onSendPressed: PropTypes.func.isRequired,
    onReceivePressed: PropTypes.func.isRequired,
    onSwapPressed: PropTypes.func.isRequired,
    onAddAssetPressed: PropTypes.func.isRequired,
    currencySymbol: PropTypes.object.isRequired,
    index: PropTypes.object.isRequired,
  }).isRequired,
};

export default WalletCarousel;
