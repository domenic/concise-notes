title: JavaScript Promises
date: 2015-10-27 19:37:41
description: promises, bluebird, etc
tags:
- javascript
- es2015
- promises
- nodejs
categories:
- programming
- JavaScript
---

I read [Best Practices for Using Promises in JS](https://60devs.com/best-practices-for-using-promises-in-js.html). Here are some concise notes expanding on this topic.

- Let's use bluebird as Promise implementation for node
- Use `.then().catch()` instead of `.then(successCb, failCb)`

```js
const promise = (shouldResolve) => new Promise((resolve, reject) => {
  if (shouldResolve) {
    resolve();
  } else {
    reject();
  }});

promise(arg)
  .then(() => { /* success */ })
  .catch(ExceptionToCatch, OtherExceptionToCatch, (err) => { /* error */})
  .catch(StrangeExceptionToCatch, (err) => { /* error */})
  .catch((err) => { /* error */}); // default
```

To define an exception to catch:

```js
function MyCustomError() {}
MyCustomError.prototype = Object.create(Error.prototype);

promise(arg)
  .then(() => { throw new MyCustomError() })
  .catch(MyCustomError, (err) => {})
  .catch((err) => {});
```

- `Promise.all([promiseA(a), promiseB(b)])` runs two async functions in parallel, but `.then(() => {})` callback has no data result argument
- Use `.spread` instead of `.then` to get this data: `.spread((dataA, dataB) => {})`
- To limit concurrency, `Promise.map([lotsOfStuff], promise, { concurrency: 3 }).then(() => {})`
- See also `.reduce` and `.filter`
- You can "pipe" your `.then` functions. If you do this, you should probably avoid using anonymous functions and enjoy more reusability, modularity, testability, readability

```js
readFile(data)
  .then(JSON.parse)
  .then(treatStuff)
  .catch(handleError)
```

- Don't abuse this thing. It's nice to read, but it breaks the event loop and could introduce race conditions
- A better approach is to pipe inside the `.then`:

```js
readFile(data)
  .then(pipe(JSON.parse, treatStuff))
  .catch(handleError)
```

## Further reading:

- http://bluebirdjs.com
- https://promise-nuggets.github.io
- http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
- https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md
