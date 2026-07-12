// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativewind } = require('nativewind/metro');

// `getSentryExpoConfig` already calls Expo's own `getDefaultConfig` internally
// (adding debug-ID/source-map support on top) — composing further Metro
// requirements on its result, rather than calling `getDefaultConfig` a
// second time, per CLAUDE.md §16 ("compose rather than overwrite").
/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

module.exports = withNativewind(config);
