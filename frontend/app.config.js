const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    package: appJson.expo.android?.package || 'com.parkflow.app',
    config: {
      ...appJson.expo.android?.config,
      googleMaps: {
        ...appJson.expo.android?.config?.googleMaps,
        apiKey: googleMapsApiKey || 'YOUR_GOOGLE_MAPS_API_KEY',
      },
    },
  },
};
