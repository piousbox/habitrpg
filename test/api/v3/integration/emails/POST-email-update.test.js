import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
// import { encrypt } from '../../../../../website/src/libs/api-v3/encryption';
import { v4 as generateUUID } from 'uuid';

describe('POST /email/update', () => {
  let user;
  let testEmail   = 'test@habitica.com';
  let endpoint    = '/email/update';
  let newEmail    = 'some-new-email@example.net';
  let thePassword = 'the-right-password';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('does not change email if one is not provided', async () => {
    await expect(user.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('does not change email if password is not provided', async () => {
    await expect(user.post(endpoint, {
      newEmail: newEmail
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('does not change email if wrong password is provided', async () => {
    await expect(user.post(endpoint, {
      newEmail: newEmail,
      password: 'wrong password'
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('changes email if new email and existing password are provided', async () => {
    await expect(user.post(endpoint, {
      newEmail: newEmail,
      password: thePassword
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid request parameters.'
    });
  });

  it('returns success if new email is the same as old', async () => {
  });

  it('does not change email if user.auth.locall.email does not exist for this user', async () => {
  });

});
