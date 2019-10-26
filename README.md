# Throttle Queue Decorator

## Install
`npm i throttled-queue-decorator`

## Usage

```javascript
const { createThrottle } = require('throttled-queue-decorator');

const throttle = createThrottle(2, 1000); // 2 requests per 1000 milliseconds

const func = (id) => axios.get(`http://example.com/record/${id}`);
const throttledFunc = throttle(func);

const main = async () => {
  return await Promise.all([
    throttledFunc(1),
    throttledFunc(2),
    throttledFunc(3),
  ])
}
//third request will be delayed by 1 second
main();
```

# Tests

`npm test`

## Credits

Use of single `setTimeout()` event copied from https://github.com/shaunpersad/throttled-queue.



