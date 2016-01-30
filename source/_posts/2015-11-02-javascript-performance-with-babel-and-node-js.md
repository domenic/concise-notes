title: "JavaScript performance with Babel and Node.js: a case against default parameters in tail call optimizations"
description: Babel might prevent some V8 optimizations to happen. Also, have you heard about Unsupported Phi Use of Arguments?
date: 2015-11-02 13:36:59
tags:
- javascript
- es2015
- babel
- nodejs
- crankshaft
- v8
categories:
- programming
- JavaScript
---

Disclaimer:

- Babel 5.8.29 (babel-core 5.8.33)
- Node.js v5.0.0
- I know these factorial examples are very artificial, please bear with me, I'll explain how I came to look at those things at the end of this post
- The title of this post might be incorrect (or too specific), I'll also talk about it later
- Optimization is not an obsession of mine. Having fun with JavaScript is.

Here are three recursive implementations of the factorial function:

```js tail-call.js https://gist.github.com/vhf/25eebd0aa0ca5b3c1aec#file-tail-call-js gist
// "naive"
function factorial1(x) {
  if (x <= 0) {
    return 1;
  } else {
    return x * factorial1(x-1);
  }
}

// tail rec using a default parameter
function factorial2(n) {
  return facRec2(n);
}
function facRec2(x, acc = 1) {
  if (x <= 1) {
    return acc;
  } else {
    return facRec2(x-1, x*acc);
  }
}

// tail rec
function factorial3(n) {
  return facRec3(n, 1);
}
function facRec3(x, acc) {
  if (x <= 1) {
    return acc;
  } else {
    return facRec3(x-1, x*acc);
  }
}
```

Which one do you think will perform better when transpiled into ES5, transformed by Babel's tail call optimization (TCO for short), and run on Node.js (therefore V8)?

It would be reasonable to expect:

- #1 to be the slowest because there's no tail call (therefore TCO does not happen)
- #2 and #3 to perform better than #1 (because TCO)
- #2 and #3 to be more or less equivalent in terms of performances

Let's [benchmark](https://github.com/bestiejs/benchmark.js) it ([suite](https://gist.github.com/vhf/ecd9dba814a4edd80680)): `babel tail-call.js > tail-call-babel.js; node tail-call-babel.js`

    #1 no tail call          x 1,562,075 ops/sec ±0.59% (98 runs sampled)
    #2 TCO/default params    x   259,399 ops/sec ±0.92% (91 runs sampled)
    #3 TCO/no default params x 7,046,389 ops/sec ±0.45% (101 runs sampled)
    Fastest is #3 TCO/no default params

- #3 is 27x (!) better than #2
- Even #1 significantly outperforms #2

So my quest began. What could be so wrong about #2?

The obvious thing to do at this point was to look at Babel's output:

```js tail-call-babel.js https://gist.github.com/vhf/d9e9750ae25e9dee6190#file-tail-call-babel-js gist
'use strict';
// #1 "naive"
function factorial1(x) {
  if (x <= 0) {
    return 1;
  } else {
    return x * factorial1(x - 1);
  }
}

// #2 tail rec using a default parameter
function factorial2(n) {
  return facRec2(n);
}
function facRec2(_x2) {
  var _arguments = arguments;
  var _again = true;

  _function: while (_again) {
    var x = _x2;
    _again = false;
    var acc = _arguments.length <= 1 || _arguments[1] === undefined ? 1 : _arguments[1];

    if (x <= 1) {
      return acc;
    } else {
      _arguments = [_x2 = x - 1, x * acc];
      _again = true;
      acc = undefined;
      continue _function;
    }
  }
}

// #3 tail rec
function factorial3(n) {
  return facRec3(n, 1);
}
function facRec3(_x3, _x4) {
  var _again2 = true;

  _function2: while (_again2) {
    var x = _x3,
        acc = _x4;
    _again2 = false;

    if (x <= 1) {
      return acc;
    } else {
      _x3 = x - 1;
      _x4 = x * acc;
      _again2 = true;
      continue _function2;
    }
  }
}
```

My first reflex was to check if TCO happened. Yes, and it did a fine job at transforming both tail recursive functions `facRec2` and `facRec3` into iterative functions. (If `factorial2` uses an iterative `facRec2`, why would `factorial1` and its still-recursive implementation perform better? It's nice to know that `factorial2` won't bark `RangeError: Maximum call stack size exceeded` at me, but at what cost?)

The next obvious thing to do was to consider the only single little difference between `facRec2` and `facRec3` in the original code: the use of an ES6 default parameter. A quick glance at Babel's output made the use of [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) stand out.

I remembered reading about [V8 "optimization killers"](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers), particularly a bit about `arguments`. Let me summarize the third section in the form of a checklist with regards to how the transformed `facRec2` makes use of parameters and `arguments`:

- [ ] Don't reassign defined parameters while also mentioning `arguments` in the body of a function
- [x] Don't leak `arguments`
- [x] Don't assign to `arguments`
- [x] Don't use `arguments` directly without `.length` or `[]`
- [x] Don't `arguments[i]` with `i` not an integer or `i > arguments.length-1`
- [x] Don't do anything else than `fn.apply(y, arguments)`

Notice how `facRec2` does `_x2 = x - 1` although `_x2` is a defined parameter *and* `arguments` is mentioned in the function body? It contradicts the first rule.

I turned to V8. Here again, the awesome bluebird wiki page was very helpful: its first section, [tooling](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#1-tooling), had been my reference for some time.

I added:

```js tail-call-babel-v8.js https://gist.github.com/vhf/01c095e09accf72108a1#file-tail-call-babel-v8-js gist
function printStatus(fn) {
  var name = fn.name;
  switch(%GetOptimizationStatus(fn)) {
    case 1: console.log(name, ' is optimized'); break;
    case 2: console.log(name, ' is not optimized'); break;
    case 3: console.log(name, ' is always optimized'); break;
    case 4: console.log(name, ' is never optimized'); break;
    case 6: console.log(name, ' is maybe deoptimized'); break;
  }
}

factorial1(100);
factorial1(100);
%OptimizeFunctionOnNextCall(factorial1);
factorial1(100);
printStatus(factorial1);

facRec2(100, 1); // I should add that facRec2(100) leads to the same perf issue
facRec2(100, 1);
%OptimizeFunctionOnNextCall(facRec2);
facRec2(100, 1);
printStatus(facRec2);

facRec3(100, 1);
facRec3(100, 1);
%OptimizeFunctionOnNextCall(facRec3);
facRec3(100, 1);
printStatus(facRec3);
```

at the end of `tail-call-babel.js` and ran the following:

    node --allow-natives-syntax tail-call-babel.js
      factorial1 is optimized
      facRec2 is not optimized
      facRec3 is optimized

It was clear that V8 — more precisely [Crankshaft](http://jayconrod.com/posts/54/a-tour-of-v8-crankshaft-the-optimizing-compiler) — was bailing out on `facRec2`.

I simply had to refactor `facRec2` to make it stop reassigning to `_x2`, right? Nope, `facRec2` still could not be optimized. Here's a [gist](https://gist.github.com/vhf/5560a6502d5147a766f6).

Going back to the checklist, I noticed that `facRec2` actually assigns to the `_arguments` object, which is a reference to `arguments`, which also contradicts something from the above checklist: Don't assign to `arguments`.

Going back to the `facRec2` generated code, I copied it to create `facRec2b`, replacing `var _arguments = arguments;` with `var $_len = arguments.length; var _arguments = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {_arguments[$_i] = arguments[$_i];}` ([full gist](https://gist.github.com/vhf/58769c1d0462094a66a3)). And V8 was happy: `facRec2b is optimized`.

New benchmark:

    #1 no tail call               x 1,562,300 ops/sec ±0.44% (98 runs sampled)
    #2 TCO/default params + leak  x   256,521 ops/sec ±0.96% (95 runs sampled)
    #2 TCO/default params no leak x   812,920 ops/sec ±0.83% (94 runs sampled)
    #3 TCO/no default params      x 7,060,279 ops/sec ±0.49% (94 runs sampled)

When optimized by V8, `facRec2b` runs already 3x faster than its `facRec2` counterpart, but still ~2x slower than `factorial1`, and their performances cannot be matched with `facRec3`.

Here were my initial conclusions:

- assigning to `_arguments`, which references `arguments`, is what prevents V8 from optimizing `facRec2`
- safely converting `arguments` to an array fixes this issue
- even with this fix, `facRec2b` is still so slow that we should simply decide not to use default parameters in any function susceptible to be TCOed by Babel
- is there a better way to get V8 to optimize `facRec2`?
- what's up with this *Don't reassign defined parameters while also mentioning `arguments` in the body of a function* rule? I thought [this](https://gist.github.com/vhf/a884c556a70bdcf21fbc) would trigger an *Assignment to parameter in arguments object* but I could not make it happen. Answer at the end of this post.

Was there more to it?

I took a closer look:

    node --trace-opt --trace_deopt --allow-natives-syntax tail-call-babel.js | grep facRec2 | grep -v facRec2b
      [compiling method 0x11469d0922c1 <JS Function facRec2 (SharedFunctionInfo 0x24a5614171a9)> using Crankshaft]
      [aborted optimizing 0x11469d0922c1 <JS Function facRec2 (SharedFunctionInfo 0x24a5614171a9)> because: Unsupported phi use of arguments]
      [disabled optimization for 0x24a5614171a9 <SharedFunctionInfo facRec2>, reason: Unsupported phi use of arguments]

Unsupported phi use of arguments. At this point I should probably say that I don't know much about V8 internals or source code. However, I was still determined to know what was wrong with `facRec2`, so I tried looking for this cryptic `Unsupported phi use of arguments` thing on Google (after all, they are the most qualified for this particular request).

It's not every day that one of my search engine requests only returns 11 results. The most interesting one is probably [the very commit that introduced this bailout reason](https://codereview.chromium.org/7553006). I took a quick glance at `HGraph::CheckPhis`: something about blocks?

I thought I would learn more trying to write a minimal program reproducing this bailout reason. But that was not an easy task. What I ended up with are these three functions:

```js unsupported-phi-use-of-arguments.js https://gist.github.com/vhf/5f88c10e2a0680a4fb19#file-unsupported-phi-use-of-arguments-js gist
function phi1() {
  var _arguments = arguments;
  if (0 === 0) { // anything evaluating to true, except a number or `true`
    _arguments = [0]; // Unsupported phi use of arguments
  }
}

function phi2() {
  var _arguments = arguments;
  for (var i = 0; i < 1; i++) {
    _arguments = [0]; // Unsupported phi use of arguments
  }
}

function phi3() {
  var _arguments = arguments;
  var again = true;
  while (again) {
    _arguments = [0]; // Unsupported phi use of arguments
    again = false;
  }
}
```

`HGraph::CheckPhis` started to make sense: reassigning `arguments` inside a "block" triggers *Unsupported phi use of arguments*. But assigning *to* `arguments` does not: it triggers a *Bad value context for arguments value*, which is already covered on [blogs](http://bahmutov.calepin.co/detecting-function-optimizations-in-v8.html) and [StackOverflow](http://stackoverflow.com/questions/29198195/whats-the-deal-with-optimising-arguments).

### So, what's your point? Conclusion.

I just wanted to practice my storytelling. And also, I wanted to raise this question: what can we do about this whole default-parameter-TCO-V8-thing? I'm not sure, so here are a few questions I would like to ask you:

- Should we just avoid using default parameters in any function susceptible to be TCOed by Babel? (in this example, x27 on V8)
- or make Babel safely create an array from `arguments` in such cases? (x3)
- or at least mention this thing in Babel's doc as soon as Babel 6 unblacklists `es6.tailCall`? (If this ever happens? If you have informations about this blacklisting, I'd love to know!)

**I'd love to get your opinion on these questions!**

In a very interesting [recent podcast](https://devchat.tv/js-jabber/171-jsj-babel-with-sebastian-mckenzie) ([[transcript](http://devchat.cachefly.net/javascriptjabber/transcript-171-jsj-babel-with-sebastian-mckenzie-js-jabber.pdf)]), Babel's author Sebastian McKenzie said several things about Babel's performances, and how outputting more performant code impacts its readability, and how that's ok because the focus is on performance: "would you care more about your code being pretty or your code being as fast as possible?", and I agree, it is certainly more important for Babel to be fast than readable.

But he also said the following: "But now it's just like you really shouldn't be reading your compiled code anyway." I have to disagree. In fact, if you indeed care about performances, you most probably *should* be reading your compiled code. (Now, don't get met wrong: I think Babel is an awesome piece of software and I love it and I use it everywhere and Sebastian McKenzie et al. are doing a terrific job, and if you think this post is bashing Babel you're just plain wrong. This disclaimer is probably useless, but I'm new to blogging and it's kind of scary.)

I would love Babel to improve on this specific point; I can't promise anything but I'll try to hack on it. And if it gets me somewhere, I'll try to write it up. My storytelling needs practice.

#### Unsupported phi use of arguments

Unsatisfied of my poor understanding of this Crankshaft bailout message I reached out to [Vyacheslav Egorov](http://mrale.ph), who first introduced it and promptly clarified he did not add the bailout itself.

I asked him what does `blocks_` contain in the `HGraph::CheckPhis` function I mentioned earlier:

> Blocks will contain CFG (control flow graph) blocks — these are not blocks in the syntactical sense, e.g. `x ? y : z` is not a block in JavaScript but will be 4 blocks in the CFG — once optimizing compiler gets to it.

What's up with this *Don't reassign defined parameters while also mentioning `arguments` in the body of a function* rule? Why does [this code](https://gist.github.com/vhf/a884c556a70bdcf21fbc) not trigger a bailout?

> This limitation is still there — but it does not apply to strict functions. I think you somehow run your code in strict mode that's why you don't see a bailout.

Indeed, I ran my tests in strict mode.

Regarding the second point of my conclusion, he said:

> Allocating array (and hope it will get handled by some optimization pass in the V8) is a bad idea.

Thanks to Vyacheslav, this bailout message starts to make sense to me. He could have only answered the few questions I sent him by email. Instead, he was kind enough to answer them, read a draft of this blog post, and even went on to write a thorough and clear explaination of *Unsupported phi use of arguments* on his blog: [Crankshaft vs arguments object](http://mrale.ph/blog/2015/11/02/crankshaft-vs-arguments-object.html) — which I still need to digest.

#### A few side notes

- [es6.tailCall recursion test case including default parameter](https://github.com/babel/babel/tree/v5.8.33/packages/babel/test/fixtures/transformation/es6.tail-call/recursion): Interesting test case with regards to V8 optimization: first because `_x2` (a defined parameter) gets reassigned which triggers *Assignment to parameter in arguments object* bailout reason, secondly because if we `var __x2 = _x2` and don't reassign `_x2` we get the infamous *Unsupported phi use of arguments*.
- Why the title of this post might be too specific: I have not investigated (yet?) whether *Unsupported phi use of arguments* is only triggered by Babel generated ES5 in the specific *TCO + default parameter* case or is also present in other Babel generated ES5 *default parameter* cases.
- Why these artifical examples: because they are short and easy to reason about. Also, cf. the following point:
- How did you come up with this thing? One of might projects depends on underscore, which does not have an equivalent of [`get`](https://lodash.com/docs#get). So I quickly drafted the tail rec `_.get` I was dreaming of, then googled for a bit and found John-David Dalton's [`_.reduce(path, _.partial(_.result, _, _, void 0), object)`](https://github.com/jashkenas/underscore/issues/2268#issuecomment-128731431) (which felt like too much black magic for me). But me being curious and it being a cold evening, I benchmarked both solutions. And mine was awfully slow. So I asked V8 about it, discovered the _phi_ thing, reimplemented my recursive `get` without its default parameter, ran the benchmark again and got this: `TCO 676,411(±0.43%) | 674,426(±0.49%) JDD`. So, basically the same performances. Underscore never fails to impress me! Which led to two things: 1/ I kept my nice recursive `get` because it's more readable, 2/ I spent my weekend researching+writing this blog post.
- I know I should probably not rely on this benchmark package and should do cpu profiling instead, and that it's easy to do with V8, etc. I think the timing differences shown here are big enough to decide that for this particular post, benchmark is good enough. But I'll do better next time.
