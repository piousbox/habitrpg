import content from '../content/index';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function sell (user, req, cb) {
  let ref = req.params;
  let key = ref.key;
  let type = ref.type;

  if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food') {
    return typeof cb === 'function' ? cb({
      code: 404,
      message: ':type not found. Must bes in [eggs, hatchingPotions, food]',
    }) : undefined;
  }
  if (!user.items[type][key]) {
    return typeof cb === 'function' ? cb({
      code: 404,
      message: `:key not found for user.items.${type}`,
    }) : undefined;
  }
  user.items[type][key]--;
  user.stats.gp += content[type][key].value;
  return typeof cb === 'function' ? cb(null, _.pick(user, splitWhitespace('stats items'))) : undefined;
};
