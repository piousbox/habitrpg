import unlock from '../../../common/script/ops/unlock';

import {
  NotAuthorized,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/api-unit.helper';
import common from '../../../common';

describe('ops.unlock', () => {
  let user;
  let fakeReq;

  beforeEach( async () => {
    user = generateUser();
  });

  it('works without analytics fn being passed', () => {
  });

  it('works without callback fn being passed', () => {
  });

  context('fullSet', () => {
    context('path has "background."', () => {
    });
    context('user alreadyOwns this item', () => {
    });
  });

  context('not fullSet', () => {
    context('user alreadyOwns this item', () => {
    });
  });

  it('user does not have enough gems', () => {
  });

  it('unlocks a "gear."', () => {
  });

  it('unlocks a "background."', () => {
  });

});
