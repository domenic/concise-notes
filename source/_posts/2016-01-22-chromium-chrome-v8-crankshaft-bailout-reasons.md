title: Chromium, Chrome, Node.js, V8, Crankshaft and bailout reasons
date: 2016-01-22 20:20:20
tags:
    - V8
    - javascript
    - es2015
    - nodejs
    - crankshaft
categories:
- programming
- JavaScript
---

This post is a short summary about all these terms, with a rough description of how V8 works. (It's rather an overview of how Crankshaft works, really.)

## Chromium, Chrome, Node.js

The Chromium Project is responsible for Chromium's development. Chromium, released in 2008, is the open-source web browser on which Google Chrome is based. Chromium's JavaScript engine is V8. Other projects such as the Opera web browser and the Node.js runtime use V8 as their JavaScript engine.

## V8

V8 compiles JavaScript to native machine code and executes it right away. In 2010, the Chromium Project released a new version of V8 including a new compiling infrastructure named Crankshaft ([#1][1], [#2][2]).

## Crankshaft and bailouts

The three most important components of Crankshaft are:

1. the base compiler, which compiles JavaScript to machine code as fast as possible without even trying to optimize most of the things,
2. the runtime profiler, which tracks how much time is spent running which parts of code and identifies *hot code*, i.e. code worth spending time optimizing, and
3. the optimizing compiler, which attempts to optimize the previously identified hot code.

Optimizing the JavaScript is always a tradeoff. We want both fast loading pages and fast running code, i.e. low start-up time and peak performance. Low start-up time is achieved by the base compiler: V8 compiles and runs the code as soon as it gets it. Peak performance is achieved by the optimizing compiler: Crankshaft optimizes the hot code. Optimizing before first running the code is not a good idea because optimizing takes time which would slow down start-up time. Also, running the unoptimized code allows Crankshaft to gather useful data about *how* to optimize it.

When the optimizing compiler gets to work, it makes optimistic assumptions about the code it's optimizing, meaning that it assumes it's optimizable and does its best.

In some cases, the runtime data (e.g. type information) provided by the base compiler to the optimizing compiler didn't cover some (edge) cases and the optimizing compiler sends V8 back to run the base compiler compiled code. This is known as a *deopt*. Later on, the same hot code will be fed to the optimizing compiler again with more runtime data, and could eventually succeed its optimization attemps. If it fails more than 10 times, it will give up with the following bailout reason: "[Optimized too many times](https://github.com/vhf/v8-bailout-reasons#optimized-too-many-times)"

In some other cases, the optimizing compiler receives code that contains JavaScript features (such as `try...catch` statements) it doesn't support, or the code doesn't respect [some limits](/blog/2016/01/15/one-simple-trick-for-javascript-performance-optimization/) set by the optimizing compiler. In this case, the optimizing compiler will also fall back to the base compiler compiled code. This is known as a *bailout* (because the optimizing compiler bails out on his optimization attempt), and whenever it happens Crankshaft is kind enough to give us a reason why the bailout happened.

This repo lists all these bailout reasons: [V8 bailout reasons](https://github.com/vhf/v8-bailout-reasons). The aim of this project is to provide insights by reproducing most of them, explaining why they happened and how to avoid them.

A function which gets optimized can run 100x faster, meaning that it's kind of wise to learn about these bailout patterns to best avoid them if you care about the JavaScript performances of the code you run on V8 (for instance if you target Chromium/Chrome, Node.js or Opera).

I'll most probably write a follow up about TurboFan -the new V8 JavaScript optimizing compiler- and what it brings to the table.

*References on this subject: [#3][3], [#4][4], [#5][5], [#6][6]*

[1]: https://en.wikipedia.org/wiki/Chromium_(web_browser)
[2]: https://en.wikipedia.org/wiki/V8_(JavaScript_engine)
[3]: http://blog.chromium.org/2010/12/new-crankshaft-for-v8.html
[4]: https://github.com/GoogleChrome/devtools-docs/issues/53
[5]: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
[6]: http://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/
