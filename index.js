/**
 * @format
 */

import {AppRegistry} from 'react-native';
// import App from './src/App';
import App from './App';
import {name as appName} from './app.json';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoicGNob3VkaGFyeTI5IiwiYSI6ImNsaXJkZDFuYzF4M2ozaXBjOTVqN2x3M3YifQ.cKBaND7z-DbrvSAudv_9pw',
);
AppRegistry.registerComponent(appName, () => App);
