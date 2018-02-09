exports.config = {
  bundles: [
    { components: ['my-app', 'app-home'] },
    { components: ['lazy-img'] }
  ],
  collections: [
    { name: '@ionic/core' }
  ],
  serviceWorker: {
    swSrc: 'src/sw.js'
  },
  globalStyle: 'src/global/app.css'
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
