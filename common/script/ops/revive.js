import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';

module.exports = function revive (user, req, cb, analytics) {
  let analyticsData;
  let base;
  let cl;
  let gearOwned;
  let item;
  let losableItems;
  let lostItem;
  let lostStat;
  if (!(user.stats.hp <= 0)) {
    return typeof cb === 'function' ? cb({
      code: 400,
      message: 'Cannot revive if not dead',
    }) : undefined;
  }
  _.merge(user.stats, {
    hp: 50,
    exp: 0,
    gp: 0,
  });
  if (user.stats.lvl > 1) {
    user.stats.lvl--;
  }
  lostStat = user.fns.randomVal(_.reduce(['str', 'con', 'per', 'int'], (m, k) => {
    if (user.stats[k]) {
      m[k] = k;
    }
    return m;
  }, {}));
  if (lostStat) {
    user.stats[lostStat]--;
  }
  cl = user.stats.class;
  gearOwned = (typeof (base = user.items.gear.owned).toObject === 'function' ? base.toObject() : undefined) || user.items.gear.owned;
  losableItems = {};
  _.each(gearOwned, (v, k) => {
    k = k.toString();
    let itm;
    if (v) {
      itm = content.gear.flat[k];
      if (itm) {
        if ((itm.value > 0 || k === 'weapon_warrior_0') &&
            (itm.klass === cl ||
             (itm.klass === 'special' && (!itm.specialClass || itm.specialClass === cl)) || itm.klass === 'armoire')) { // eslint-disable-line no-extra-parens
          losableItems[k] = k;
          return k;
        }
      }
    }
  });
  lostItem = user.fns.randomVal(losableItems);
  item = content.gear.flat[lostItem];
  if (item) {
    user.items.gear.owned[lostItem] = false;
    if (user.items.gear.equipped[item.type] === lostItem) {
      user.items.gear.equipped[item.type] = `${item.type}_base_0`;
    }
    if (user.items.gear.costume[item.type] === lostItem) {
      user.items.gear.costume[item.type] = `${item.type}_base_0`;
    }
  }
  if (typeof user.markModified === 'function') {
    user.markModified('items.gear');
  }
  analyticsData = {
    uuid: user._id,
    lostItem,
    gaLabel: lostItem,
    category: 'behavior',
  };
  if (analytics !== null) {
    analytics.track('Death', analyticsData);
  }
  if (typeof cb === 'function') {
    return cb(item ? {
      code: 200,
      message: i18n.t('messageLostItem', {
        itemText: item.text(req.language),
      }, req.language),
    } : null, user);
  }
};
