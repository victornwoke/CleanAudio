const config = require("./app.json");

module.exports = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const mode = profile === "development" || (!profile && process.env.NODE_ENV !== "production")
    ? "development"
    : "production";
  const expo = { ...config.expo };
  expo.plugins = expo.plugins.map((plugin) =>
    Array.isArray(plugin) && plugin[0] === "onesignal-expo-plugin"
      ? [plugin[0], { ...plugin[1], mode }]
      : plugin
  );
  return expo;
};
