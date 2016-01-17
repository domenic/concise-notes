title: "Making Babel fast with ES2015 rest parameters"
date: 2015-12-17 13:36:59
description: How I increased Babel ES2015 performances with two simple patches and some research
tags:
- javascript
- es2015
- babel
- nodejs
categories:
- programming
- JavaScript
alias:
- 2015/12/17/follow-up/
---

This post is a follow-up of [JavaScript performance with Babel and Node.js: a case against default parameters in tail call optimizations](http://vhf.github.io/blog/2015/11/02/javascript-performance-with-babel-and-node-js/). At the time, Babel 6 had only been published for a few hours.

When Babel 6 was released, I quickly realised that I kind of missed my target: tail call optimisation had been dropped in the process. But all was not lost, I could still investigate Babel's use of `arguments`.

# Fixture tests

First, I looked at a lot of fixture tests. These are files meant to test if a particular Babel transform or plug-in works properly. They consist of two files: `actual.js` (ES2015 code) and `expected.js`. The goal of this test is to check if the output of `babel actual.js` matches the content of `expected.js`.

I noticed something about a particular transform : `babel-plugin-transform-es2015-parameters`, more precisely about its handling of `rest` parameters:

```js actual.js https://github.com/babel/babel/blob/82ddbc0ecd9a16fdb173bbcf85bc10ade6f9828d/packages/babel-plugin-transform-es2015-parameters/test/fixtures/parameters/rest-arrow-functions/actual.js
var concat = (...arrs) => {
  var x = arrs[0];
  var y = arrs[1];
};
```

```js expected.js https://github.com/babel/babel/blob/82ddbc0ecd9a16fdb173bbcf85bc10ade6f9828d/packages/babel-plugin-transform-es2015-parameters/test/fixtures/parameters/rest-arrow-functions/expected.js
var concat = function () {
  var x = arguments[0];
  var y = arguments[1];
};
```

This is unsafe. V8 will only be able to optimise the `concat` function if the `arguments` object has a length greater than 1. Otherwise, for example `concat([0])`, the attempt to access the undefined `arguments[1]` will force V8 to rematerialize `arguments` on the fly, preventing the whole function from being optimised.

# First attempt

Having no idea about Babel's codebase and internals, it took me a whole weekend to come up with a first patch: [#2833: Have es2015 rest transform safely use `arguments`](https://github.com/babel/babel/pull/2833). It fixed some of the rest-transformed unsafe use of `arguments` and it got merged after five weeks (which is way too long by the way, but I don't blame anyone, I'm pretty sure it was an exceptional situation where someone said they would take care of this PR, then got busy, and in the meantime nobody saw the need to take over because someone was already in charge. No big deal).

At first I was pretty happy with this patch. The new `expected.js` looked like this:

```js expected.js https://github.com/babel/babel/blob/9a97d92217dffcf6478611067c1525fa4004fce4/packages/babel-plugin-transform-es2015-parameters/test/fixtures/parameters/rest-arrow-functions/expected.js
var concat = function () {
  var x = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];
  var y = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];
};
```

which was safe. Some basic benchmarks were showing a 4x speedup. The tests were green. I had learned a lot about how Babel works.

Until [someone noticed the pattern I was using was a bit weird](https://github.com/babel/babel/pull/2833#discussion_r47472444). In fact, the reason I initially chose this pattern was that I got it from [here](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-parameters/src/default.js#L8-L11). While it makes sense to use it for default parameters handling (`ARGUMENTS.length <= INDEX || ARGUMENTS[INDEX] === undefined ? DEFAULT_VALUE : ARGUMENTS[INDEX];`), it becomes overly complicated in the case where `DEFAULT_VALUE` is `undefined`.

# Second attempt

I was fixing this pattern issue, replacing it with `ARGUMENTS.length <= INDEX ? undefined : ARGUMENTS[INDEX]`, when I noticed my previous patch was incomplete.

```js actual.js https://github.com/babel/babel/blob/15969a09046a50ae2ae0503725b7fb00cdd7137f/packages/babel-plugin-transform-es2015-parameters/test/fixtures/parameters/rest-multiple/actual.js
var t = function (f, ...items) {
    var x = f;
    x = items[0];
    x = items[1];
};
```

was still being converted to:

```js expected.js https://github.com/babel/babel/blob/15969a09046a50ae2ae0503725b7fb00cdd7137f/packages/babel-plugin-transform-es2015-parameters/test/fixtures/parameters/rest-multiple/expected.js
var t = function (f) {
    var x = f;
    x = arguments[1];
    x = arguments[2];
};
```

The transform was not taking into account the presence of a rest parameter when there were other parameters involved (`function (f, ...items)`). After I fixed this issue, I had another one: `x = items[1]` was correctly transformed, but not `x[1] = ...`, `x.p = ...` or `... = items[1] || something`. I had to generalise the patch to (safely) cover all possible occurrences of accessing a value from a rest argument.

I added a fixture test, reworked my patch and opened a new PR: [Fixing T6818](https://github.com/babel/babel/pull/3165).

```js actual.js
function u(f, g, ...items) {
    var x = f;
    var y = g;
    x[12] = items[0];
    y.prop = items[1];
    var z = items[2] | 0 || 12;
}
```

```js expected.js
function u(f, g) {
    var x = f;
    var y = g;
    x[12] = arguments.length <= 2 ? undefined : arguments[2];
    y.prop = arguments.length <= 3 ? undefined : arguments[3];
    var z = (arguments.length <= 4 ? undefined : arguments[4]) | 0 || 12;
}
```

Hopefully, this part is done. I'll try to find some other Crankshaft-related-JS-anti-patterns in what Babel generates.
