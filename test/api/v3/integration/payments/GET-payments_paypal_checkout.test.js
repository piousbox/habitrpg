import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments : paypal #checkout', () => {
  let endpoint = '/payments/paypal/checkout';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('verifies subscription', async () => {
    await expect(user.get(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingAuthParams'),
    });
  });
});
