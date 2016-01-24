title: ES6 Destructuring
description: A few things about destructuring and assigning default values.
date: 2015-10-28 15:29:42
tags:
- javascript
- es2015
categories:
- programming
- JavaScript
---

- Destructuring works exactly as its syntax suggests
- The only tricky point is object destructuring without variable declaration
  + with declaration: `let {x: a} = {x: 'a'};`
  + without declaration: `({x: a} = {x: 'a'});` (assuming that `a` has already been declared)
  + It's simply because [a bare object is not valid syntax](http://stackoverflow.com/questions/17382024/why-is-a-bare-array-valid-javascript-syntax-but-not-a-bare-object)
- Default arguments and destructuring:

```js
/* prop === 'default' */ let { prop = 'default' } = {};
/* prop === 'value' */   let { prop = 'default' } = { prop: 'value' };
/* name === 'value' */   let { prop: name = 'default' } = { prop: 'value' };
```

- Default arguments also work for arrays:
  + `let [head = "default"] = [];`
- Default values for destructuring assignment is especially useful as function arguments defaults:

```js
let destructObject = ({ a = 'a', b = 'b' } = {}) => [a, b];
let destructObject = ({ a: arg1 = 'a', b: arg2 = 'b' } = {}) => [arg1, arg2];
destructObject({});       // ['a', 'b]
destructObject({ b: 'c' }); // ['a', 'c']
```
