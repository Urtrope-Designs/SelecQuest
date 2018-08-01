import { render } from '@stencil/core/dist/testing';
import { PlayScreen } from './play-screen';

describe('PlayScreen', () => {
  it('should build', () => {
    expect(new PlayScreen()).toBeTruthy();
  });

  describe('rendering', () => {
    beforeEach(async () => {
      await render({
        components: [PlayScreen],
        html: '<sq-play-screen></sq-play-screen>'
      });
    });
  });
});