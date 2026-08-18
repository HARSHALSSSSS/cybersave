/**
 * @format
 */

import 'react-native-gesture-handler';
import '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import { enableFreeze, enableScreens } from 'react-native-screens';
import App from './app/App';
import { name as appName } from './app.json';

// Back navigation with native containers, and blurred screens stop re-rendering.
enableScreens(true);
enableFreeze(true);

AppRegistry.registerComponent(appName, () => App);
