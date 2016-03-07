import {
  generateUser,
  requester,
  translate as t,
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';
import { encrypt } from '../../../../../website/src/libs/api-v3/encryption';

describe('POST /user/update-username', async () => {
  let endpoint = "/user/update-username";
  let user;
  let newUsername = 'new-username';
  let newMalformedUsername = 'new-#$%^-malformed-username';
  let existingUsername = 'existing-username';
  let password = 'password'; // from habitrpg/test/helpers/api-integration/v3/object-generators.js
  let wrongPassword = 'wrong-password';

  beforeEach(async () => {
    user = await generateUser();
  });
  
  it('successfully changes username', async () => {
    let response = await user.post(endpoint, {
      username: newUsername,
      password,
    });
    expect(response).to.eql({ username: newUsername });
    user = await User.findOne({ _id: user._id });
    expect(user.auth.local.username).to.eql(newUsername);
  });

  context('errors', () => {
    it('new username is malformed', async () => {
      await expect(user.post(endpoint, {
        username: newMalformedUsername,
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('malformedUsername'),
      });
    });
    it('new username is unavailable', async () => {
      await expect(user.post(endpoint, {
        username: existingUsername,
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('usernameTaken'),
      });
    });
    it('password is wrong', async () => {
      await expect(user.post(endpoint, {
        username: newUsername,
        password: wrongPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('wrongPassword'),
      });
    });
    it('social-only user', async () => {
      expect(false).to.eql(true); // @TODO
      await expect(socialUser.post(endpoint, {
        username: newUsername,
        password,
      })).to.eventually.by.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('userHasNoLocalRegistration'),
      });
    });
    it('new username is not provided', async () => {
      await expect(user.post(endpoint, {
        password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('malformedUsername'),
      });
    });
  });
});
