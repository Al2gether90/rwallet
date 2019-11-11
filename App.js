import './shim.js'
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {Provider} from "react-redux";

import store from './src/redux/store';
import RootSwitchNavigator from './src/navigation/container';
import appContext from './src/common/appContext'

export default class App extends Component{
  render() {
    return (
        <Provider store={store}>
          <RootSwitchNavigator />
        </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

appContext.init();



