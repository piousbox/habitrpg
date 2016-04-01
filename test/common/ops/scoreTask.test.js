/* eslint-disable no-shadow */
import scoreTask from '../../../common/script/ops/scoreTask';
import {
  generateUser,
  generateDaily,
  generateHabit,
  generateTodo,
  generateReward,
} from '../../helpers/api-unit.helper';
import common from '../../../common';
// import i18n from '../../../common/script/i18n';
// import {
//   NotAuthorized,
// } from '../../../common/script/libs/errors';

let EPSILON = 0.0001; // negligible distance between datapoints

/* Helper Functions */
let rewrapUser = (user) => {
  user._wrapped = false;
  common.wrap(user);
  return user;
};

let beforeAfter = async () => {
  let before = await generateUser();
  let after = _.cloneDeep(before);
  rewrapUser(after);

  return {
    before,
    after,
  };
};

let expectGainedPoints = (before, after, beforeTask, afterTask) => {
  expect(after.stats.hp).to.eql(50);
  expect(after.stats.exp).to.be.greaterThan(before.stats.exp);
  expect(after.stats.gp).to.be.greaterThan(before.stats.gp);
  expect(afterTask.value).to.be.greaterThan(beforeTask.value);
  if (afterTask.type === 'habit') {
    expect(afterTask.history).to.have.length(1);
  }
};

let expectClosePoints = (before, after, beforeTask, task) => {
  expect(Math.abs(after.stats.exp - before.stats.exp)).to.be.lessThan(EPSILON);
  expect(Math.abs(after.stats.gp - before.stats.gp)).to.be.lessThan(EPSILON);
  expect(Math.abs(task.value - beforeTask.value)).to.be.lessThan(EPSILON);
};

let _expectRoughlyEqualDates = (date1, date2) => {
  expect(date1.toString()).to.eql(date2.toString());
};

describe('shared.ops.scoreTask', () => {
  let ref;

  beforeEach(async () => {
    ref = await beforeAfter();
  });

  it('throws an error when scoring a reward if user does not have enough gold', async () => {
    let reward = await generateReward({ userId: ref.after._id, text: 'some reward', value: 100 });
    expect(scoreTask.bind(_, { user: ref.after, task: reward })).to.throw('NotAuthorized: Not Enough Gold');
    // expect(() => {
    //   scoreTask({ user: ref.after, task: reward });
    // }).to.throw(new NotAuthorized(i18n.t('messageNotEnoughGold')));
  });

  it('checks that the streak parameters affects the score', async () => {
    let task = await generateDaily({ userId: ref.after._id, text: 'task to check streak' });
    scoreTask({ user: ref.after, task, direction: 'up', cron: false });
    scoreTask({ user: ref.after, task, direction: 'up', cron: false });
    expect(task.streak).to.eql(2);
  });

  it('completes when the task direction is up', async () => {
    let task = await generateTodo({ userId: ref.after._id, text: 'todo to complete', cron: false });
    scoreTask({ user: ref.after, task, direction: 'up' });
    expect(task.completed).to.eql(true);
    _expectRoughlyEqualDates(task.dateCompleted, new Date());
  });

  it('uncompletes when the task direction is down', async () => {
    let task = await generateTodo({ userId: ref.after._id, text: 'todo to complete', cron: false });
    scoreTask({ user: ref.after, task, direction: 'down' });
    expect(task.completed).to.eql(false);
    expect(task.dateCompleted).to.not.exist;
  });

  describe('verifies that times parameter in scoring works', async () => {
    let habit;

    beforeEach(async () => {
      ref = await beforeAfter();
      habit = await generateHabit({ userId: ref.after._id, text: 'some habit' });
    });

    it('works', async () => {
      let delta1, delta2, delta3;

      delta1 = scoreTask({ user: ref.after, task: habit, direction: 'up', times: 5, cron: false });

      ref = await beforeAfter();
      habit = await generateHabit({ userId: ref.after._id, text: 'some habit' });

      delta2 = scoreTask({ user: ref.after, task: habit, direction: 'up', times: 4, cron: false });

      ref = await beforeAfter();
      habit = await generateHabit({ userId: ref.after._id, text: 'some habit' });

      delta3 = scoreTask({ user: ref.after, task: habit, direction: 'up', times: 5, cron: false });

      expect(Math.abs(delta1 - delta2)).to.be.greaterThan(EPSILON);
      expect(Math.abs(delta1 - delta3)).to.be.lessThan(EPSILON);
    });
  });

  describe('scores', () => {
    let options = {};
    let habit;
    let freshDaily, daily;
    let freshTodo, todo;

    beforeEach(async () => {
      ref = await beforeAfter(options);
      habit = await generateHabit({ userId: ref.after._id, text: 'some habit' });
      freshDaily = await generateDaily({ userId: ref.after._id, text: 'some daily' });
      daily = await generateDaily({ userId: ref.after._id, text: 'some daily' });
      freshTodo = await generateTodo({ userId: ref.after._id, text: 'some todo' });
      todo = await generateTodo({ userId: ref.after._id, text: 'some todo' });

      expect(habit.history.length).to.eql(0);

      // before and after are the same user
      expect(ref.before._id).to.exist;
      expect(ref.before._id).to.eql(ref.after._id);
    });

    context('habits', () => {
      it('up', async () => {
        options = { user: ref.after, task: habit, direction: 'up', times: 5, cron: false };
        scoreTask(options);

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.greaterThan(0);

        expect(ref.after.stats.hp).to.eql(50);
        expect(ref.after.stats.exp).to.be.greaterThan(ref.before.stats.exp);
        expect(ref.after.stats.gp).to.be.greaterThan(ref.before.stats.gp);
      });

      it('down', async () => {
        scoreTask({user: ref.after, task: habit, direction: 'down', times: 5, cron: false}, {});

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.lessThan(0);

        expect(ref.after.stats.hp).to.be.lessThan(ref.before.stats.hp);
        expect(ref.after.stats.exp).to.eql(0);
        expect(ref.after.stats.gp).to.eql(0);
      });
    });

    context('dailys', () => {
      it('up', () => {
        scoreTask({user: ref.after, task: daily, direction: 'up'});
        expectGainedPoints(ref.before, ref.after, freshDaily, daily);
      });

      it('up, down', () => {
        scoreTask({user: ref.after, task: daily, direction: 'up'});
        scoreTask({user: ref.after, task: daily, direction: 'down'});
        expectClosePoints(ref.before, ref.after, freshDaily, daily);
      });
    });

    context('todos', () => {
      it('up', () => {
        scoreTask({user: ref.after, task: todo, direction: 'up'});
        expectGainedPoints(ref.before, ref.after, freshTodo, todo);
      });

      it('up, down', () => {
        scoreTask({user: ref.after, task: todo, direction: 'up'});
        scoreTask({user: ref.after, task: todo, direction: 'down'});
        expectClosePoints(ref.before, ref.after, freshTodo, todo);
      });
    });
  });
});
