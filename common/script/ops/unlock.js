import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function unlock (user, req, cb, analytics) {
  let alreadyOwns;
  let analyticsData;
  let cost;
  let fullSet;
  let k;
  let path;
  let split;
  let v;

  path = req.query.path;
  fullSet = path.indexOf(',') !== -1;
  if (path.indexOf('background.') !== -1) {
    if (fullSet) {
      cost = 3.75;
    } else {
      cost = 1.75;
    }
  } else if (fullSet) {
    cost = 1.25;
  } else {
    cost = 0.5;
  }
  alreadyOwns = !fullSet && user.fns.dotGet(`purchased.${path}`) === true;
  if ((user.balance < cost || !user.balance) && !alreadyOwns) {
    return typeof cb === 'function' ? cb({
      code: 401,
      message: i18n.t('notEnoughGems', req.language),
    }) : undefined;
  }
  if (fullSet) {
    _.each(path.split(','), (p) => {
      if (path.indexOf('gear.') !== -1) {
        user.fns.dotSet(p, true);
        return true;
      }
      user.fns.dotSet(`purchased.${p}`, true);
      return true;
    });
  } else {
    if (alreadyOwns) {
      split = path.split('.');
      v = split.pop();
      k = split.join('.');
      if (k === 'background' && v === user.preferences.background) {
        v = '';
      }
      user.fns.dotSet(`preferences.${k}`, v);
      return typeof cb === 'function' ? cb(null, req) : undefined;
    }
    user.fns.dotSet(`purchased.${path}`, true);
  }
  user.balance -= cost;
  if (path.indexOf('gear.') !== -1) {
    if (typeof user.markModified === 'function') {
      user.markModified('gear.owned');
    }
  } else if (typeof user.markModified === 'function') {
    user.markModified('purchased');
  }
  analyticsData = {
    uuid: user._id,
    itemKey: path,
    itemType: 'customization',
    acquireMethod: 'Gems',
    gemCost: cost / 0.25,
    category: 'behavior',
  };
  if (analytics !== null) {
    analytics.track('acquire item', analyticsData);
  }
  return typeof cb === 'function' ? cb(null, _.pick(user, splitWhitespace('purchased preferences items'))) : undefined;
};
