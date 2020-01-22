import React, { Component } from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import EarnHeader from '../../components/headers/header.earn';
import Loc from '../../components/common/misc/loc';
import RSKad from '../../components/common/rsk.ad';
import BasePageGereral from '../base/base.page.general';

const headerImage = require('../../assets/images/misc/title.image.spend.png');

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginHorizontal: 30,
    marginBottom: 50,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 30,
  },
  greenLine: {
    marginTop: 7,
    marginBottom: 15,
    width: 35,
    height: 3,
    backgroundColor: '#00B520',
    borderRadius: 1.5,
  },
  listText: {
    lineHeight: 25,
  },
});

export default class SpendIndex extends Component {
  static navigationOptions = () => ({
    header: null,
  });

  render() {
    return (
      <BasePageGereral
        isSafeView={false}
        hasBottomBtn={false}
        hasLoader={false}
        renderAccessory={() => <RSKad />}
        headerComponent={<EarnHeader title="Asset Management at Your Fingertips" imageSource={headerImage} imageBgColor="#61DABF" />}
      >
        <View style={styles.body}>
          <Loc style={[styles.title]} text="Below features are coming soon to Spend…" />
          <View style={styles.greenLine} />
          <Loc style={[styles.listText]} text="- Buy 100+ Gift Cards with cryptocurrency" />
          <Loc style={[styles.listText]} text="- Swap between any token in your wallet" />
          <Loc style={[styles.listText]} text="- Multi-sign approval of transactions" />
        </View>
      </BasePageGereral>
    );
  }
}

SpendIndex.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired,
  }).isRequired,
};
