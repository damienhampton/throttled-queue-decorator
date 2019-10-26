'use strict'

function createThrottle(requestsPerInteval = 100, interval = 0){
  const queue = [];
  let lastCalled = Date.now() - interval;
  let timeoutRef = null;
  let remainingAllowance = 0;

  function processQueue(){

    const threshold = lastCalled + interval;
    const now = Date.now();

    if ((now < threshold) && !remainingAllowance) {
      clearTimeout(timeoutRef);
      timeoutRef = setTimeout(processQueue, threshold - now);
      return;
    }

    const numTasks = remainingAllowance || requestsPerInteval;
    const tasks = queue.splice(0, numTasks);
    remainingAllowance = numTasks - tasks.length;
    tasks.map(t => t());

    lastCalled = Date.now();
    if(queue.length){
      if(remainingAllowance){
        processQueue();
      }else{
        timeoutRef = setTimeout(processQueue, interval);
      }
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