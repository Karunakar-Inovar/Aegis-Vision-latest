module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["@babel/preset-typescript", { allowDeclareFields: true }],
      ["@babel/preset-react", { runtime: "automatic", importSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};

