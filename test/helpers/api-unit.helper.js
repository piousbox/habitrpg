import '../../website/src/libs/api-v3/i18n';
import mongoose from 'mongoose';
import { defaultsDeep as defaults } from 'lodash';
import { model as User } from '../../website/src/models/user';
import { model as Group } from '../../website/src/models/group';
import mongo from './mongo'; // eslint-disable-line
import moment from 'moment';
import * as Tasks from '../../website/src/models/task';

afterEach((done) => {
  sandbox.restore();
  mongoose.connection.db.dropDatabase(done);
});

export { sleep } from './sleep';

export function generateUser (options = {}) {
  return new User(options).toObject();
}

export function generateGroup (options = {}) {
  return new Group(options).toObject();
}

export function generateRes (options = {}) {
  let defaultRes = {
    send: sandbox.stub(),
    status: sandbox.stub().returnsThis(),
    sendStatus: sandbox.stub().returnsThis(),
    json: sandbox.stub(),
    locals: {
      user: generateUser(options.localsUser),
      group: generateGroup(options.localsGroup),
    },
  };

  return defaults(options, defaultRes);
}

export function generateReq (options = {}) {
  let defaultReq = {
    body: {},
    query: {},
    headers: {},
  };

  return defaults(options, defaultReq);
}

export function generateNext (func) {
  return func || sandbox.stub();
}

export function generateHistory (days) {
  let history = [];
  let now = Number(moment().toDate());

  while (days > 0) {
    history.push({
      value: days,
      date: Number(moment(now).subtract(days, 'days').toDate()),
    });
    days--;
  }

  return history;
}

export async function generateHabit (update = {}) {
  let type = 'habit';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateDaily (update = {}) {
  let type = 'daily';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateReward (update = {}) {
  let type = 'reward';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

export async function generateTodo (update = {}) {
  let type = 'todo';
  let task = new Tasks[type](update);
  await task.save({ validateBeforeSave: false });
  return task;
}

