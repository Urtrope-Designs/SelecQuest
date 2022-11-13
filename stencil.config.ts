import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      // serviceWorker: null,
    }
  ],
  globalStyle: 'src/global/app.css',
  plugins: [
    sass()
  ],
};
