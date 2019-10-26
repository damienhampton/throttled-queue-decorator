'use strict'

function createThrottle(requestsPerInteval = 100, interval = 0){
  const queue = [];
  let lastCalled = Date.now() - interval;
  let timeoutRef = null;

  function processQueue(){

    const threshold = lastCalled + interval;
    const now = Date.now();

    if (now < threshold) {
      clearTimeout(timeoutRef);
      timeoutRef = setTimeout(processQueue, threshold - now);
      return;
    }

    const tasks = queue.splice(0, requestsPerInteval);
    tasks.map(t => t());

    lastCalled = Date.now();
    if(queue.length){
      timeoutRef = setTimeout(processQueue, interval);
    }else{
      timeoutRef = null;
    }
  }

  function enqueue(callback){
    queue.push(callback);
    if(!timeoutRef){
      processQueue();
    }
  }
  return (func) => (args) => {
    return new Promise((resolve) => {
      enqueue(() => {
        resolve(func(args));
      })
    })
  }
}

module.exports = { createThrottle };