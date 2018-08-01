import { render } from '@stencil/core/dist/testing';
import { SqApp } from './sq-app';

describe('sq-app', () => {
  it('should build', () => {
    expect(new SqApp()).toBeTruthy();
  });

  describe('rendering', () => {
    beforeEach(async () => {
      await render({
        components: [SqApp],
        html: '<sq-app></sq-app>'
      });
    });
  });
});