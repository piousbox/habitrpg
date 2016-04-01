import revive from '../../../common/script/ops/revive';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.revive', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('does not revive if not dead', () => {
  });

  it('decrements user level', () => {
  });

  it('sets hp at 50', () => {
  });

  it('set exp as 0', () => {
  });

  it('decrements a random stat of the user', () => {
  });

  context('loses a random item', () => {
    it('that is a piece of equipment', () => {
    });
    it('that is a costume', () => {
    });
  });

  it('sends "Death" analytics event', () => {
  });

  it('returns the callback with messageLostItem', () => {
  });

});
