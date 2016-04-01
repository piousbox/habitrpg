import sell from '../../../common/script/ops/sell';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.sell', () => {
  let user;
  let req;
  let cb;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns 404 if type is not found', () => {
  });

  it('returns 404 if the user\'s key is not found for this type.', () => {
  });

  it('increases user\'s gp', () => {
  });

  it('decrements the user\'s key count for this type', () => {
  });

});
