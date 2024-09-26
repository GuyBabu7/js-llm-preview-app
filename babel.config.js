module.exports = api => {
  api.cache(false);

  return {
    presets: [
      [
        '@babel/preset-env',

        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/typescript',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      [
        'babel-plugin-root-import',
        {
          rootPathSuffix: './src',
          rootPathPrefix: '/',
        },
      ],
    ],
    sourceMaps: 'both',
    retainLines: true,
  };
};
