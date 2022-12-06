/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './src/config.json';
 
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
