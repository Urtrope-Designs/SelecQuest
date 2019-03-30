import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
    }
  ],
  globalStyle: 'src/global/app.css',
  plugins: [
    sass()
  ]
};
