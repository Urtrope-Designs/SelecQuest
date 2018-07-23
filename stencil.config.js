const sass = require('@stencil/sass');

exports.config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js'
      }
    }
  ],
  globalScript: 'src/global/index.ts',
  globalStyle: 'src/global/app.css',
  plugins: [
    sass()
  ]
};
