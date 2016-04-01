import reset from '../../../common/script/ops/reset';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.reset', () => {
  let user;
  let req;
  let cb;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('resets habits, dailys, todos, rewards', () => {
  });

  it('resets stats: hp, lbl, gp, exp', () => {
  });

  it('resets equipped and costume gear', () => {
  });

  it('resets owner gear', () => {
  });

  it('calls the user\'s markModified()', () => {
  });

  it('sets user\'s preference on costume to false', () => {
  });

  it('returns callback', () => {
  });

});
