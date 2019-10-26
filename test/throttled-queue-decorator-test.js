const assert = require('chai').assert;

const { createThrottle } = require('../throttled-queue-decorator');

const func = (ret) => async () => ret;
const tap = x => { console.log(x); return x; }

describe('throttle request', function(){
  this.timeout(15000);
  describe('running func once should return immediately', () => {
    it('should return within 10ms', async () => {
      const throttle = createThrottle();
      const throttledFunc = throttle(func('cat'));

      const timer = createTimer();
      const result = await throttledFunc();

      assert.isBelow(timer.lap(), 10, 'should return within 10ms');
      assert.equal(result, 'cat');
    })
  })
  describe('running func twice should require 3s', () => {
    it('should return after 3s', async () => {
      const throttle = createThrottle(1, 3000);
      const throttledFunc = throttle(func('cat'));

      const timer = createTimer();

      const result = await Promise.all([
        throttledFunc(),
        throttledFunc(),
      ])

      assert.isAbove(timer.lap(), 2800, 'should return after 3s');
      assert.deepEqual(result, ['cat', 'cat']);
    })
  })
  describe('func calls should be equally spaced', () => {
    it('should equally space calls', async () => {
      const throttle = createThrottle(1, 2000);
      const returnTimes = [];
      const timer = createTimer();
      const func = () => returnTimes.push(timer.lap());
      const throttledFunc = throttle(func);

      const result = await Promise.all([
        throttledFunc(),
        throttledFunc(),
        throttledFunc(),
      ])

      assert.isAbove(returnTimes[0], -10, 'should return imediately');
      assert.isBelow(returnTimes[0], 10, 'should return imediately');
      assert.isAbove(returnTimes[1], 1900, 'should return after 2s');
      assert.isBelow(returnTimes[1], 2100, 'should return after 2s');
      assert.isAbove(returnTimes[2], 3900, 'should return after 4s');
      assert.isBelow(returnTimes[2], 4100, 'should return after 4s');
    })
  })
  describe('func calls should be equally spaced', () => {
    it('should equally space calls', async () => {
      const throttle = createThrottle(2, 2000);
      const returnTimes = [];
      const timer = createTimer();
      const func = () => returnTimes.push(timer.lap());
      const throttledFunc = throttle(func);

      const result = await Promise.all([
        throttledFunc(),
        throttledFunc(),
        throttledFunc(),
        throttledFunc(),
      ])

      assert.isAbove(returnTimes[0], -10, 'should return imediately');
      assert.isBelow(returnTimes[0], 10, 'should return imediately');
      assert.isAbove(returnTimes[1], -10, 'should return imediately');
      assert.isBelow(returnTimes[1], 10, 'should return imediately');
      assert.isAbove(returnTimes[2], 1900, 'should return after 2s');
      assert.isBelow(returnTimes[2], 2100, 'should return after 2s');
      assert.isAbove(returnTimes[3], 1900, 'should return after 2s');
      assert.isBelow(returnTimes[3], 2100, 'should return after 2s');
    })
  })
  describe('one throttle two functions', () => {
    it('should return after 3s', async () => {
      const throttle = createThrottle(1, 3000);
      const throttledFunc1 = throttle(func('cat1'));
      const throttledFunc2 = throttle(func('cat2'));

      const timer = createTimer();

      const result = await Promise.all([
        throttledFunc1(),
        throttledFunc2(),
      ])

      end = timer.lap();
      assert.isAbove(end, 2800, 'should return after 3s');
      assert.isBelow(end, 3200, 'should return after 3s');
      assert.deepEqual(result, ['cat1', 'cat2']);
    })
  })
  describe('two separate throttles', () => {
    it('should return in less than 10ms', async () => {
      const throttle1 = createThrottle(1, 3000);
      const throttle2 = createThrottle(1, 3000);
      const throttledFunc1 = throttle1(func('cat1'));
      const throttledFunc2 = throttle2(func('cat2'));

      const timer = createTimer();

      const result = await Promise.all([
        throttledFunc1(),
        throttledFunc2(),
      ])

      assert.isBelow(timer.lap(), 10, 'should return within 10ms');
      assert.deepEqual(result, ['cat1', 'cat2']);
    })
  })
})

const createTimer = () => {
  const start = Date.now()
  return {
    lap(){
      return Date.now() - start;
    }
  }
}